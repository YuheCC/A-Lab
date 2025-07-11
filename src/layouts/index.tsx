import { Outlet } from "umi";
import Header from "@/components/Header";
import { usePlotDataStore } from "@/models/usePlotData";
import { useEffect, useState, createContext } from "react";
// import "./index.less";
import { useTranslation } from "react-i18next";
import { COMMERCIAL_SCORE_MAP } from "@/utils";
import { authFetch, getAPIUrl } from "@/utils";
import { useAuthStore } from "@/models/useAuth";
import { MessageProvider } from "@/components/MessageProvider";

const API_URL = getAPIUrl();

export const FavoriteContext = createContext<any>(null);

const FullNavLayout = () => {
    const { fetchInitialData , fetchData} = usePlotDataStore();
    const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState<any>({});
    const { t } = useTranslation();
    const { verifyAuth } = useAuthStore();

    useEffect(() => {
        verifyAuth();
    }, []);

    const handleAddToFavorites = async (molecule: any) => {
        // Use SMILES as unique identifier for the molecule
        const smiles = molecule.smiles;
    
        // Update state for just this specific molecule
        setMoleculeFavoriteStatus((prev: any) => ({
          ...prev,
          [smiles]: { loading: true, success: null, error: null }
        }));
    
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error(t('chatbox.errors.loginRequired'));
          }
    
          // Get the raw commercial score (numeric 0-3)
          const rawCommercialScore = molecule.properties?.commercial_score || molecule.properties?.COMMERCIAL_SCORE;
          
          // Convert commercial score from numeric to descriptive text
          const commercialScoreText = rawCommercialScore !== null && rawCommercialScore !== undefined 
            ? COMMERCIAL_SCORE_MAP[rawCommercialScore as keyof typeof COMMERCIAL_SCORE_MAP] || null
            : null;
    
          // Prepare favorite data from molecule properties
          const favoriteData = {
            smiles: molecule.smiles,
            molecular_weight: molecule.properties?.molwt || null,
            homo_ev: molecule.properties?.homo_eV || null,
            lumo_ev: molecule.properties?.lumo_eV || null,
            esp_min_ev: molecule.properties?.esp_min_eV || null,
            esp_max_ev: molecule.properties?.esp_max_eV || null,
            predicted_melting_point: molecule.properties?.predicted_mp || null,
            predicted_boiling_point: molecule.properties?.predicted_bp || null,
            predicted_fp_celsius: molecule.properties?.predicted_fp_celsius || molecule.properties?.predicted_fp || null,
            combustion_enthalpy_ev: molecule.properties?.combustion_enthalpy_ev || molecule.properties?.combustion_enthalpy || null,
            commercial_score: commercialScoreText,
            commercial_link: molecule.properties?.commercial_link || molecule.COMMERCIAL_LINK || null,
            functional_groups: molecule.properties?.functional_groups || null,
            umap_x: molecule.x || null,
            umap_y: molecule.y || null
          };
    
          const response = await authFetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(favoriteData)
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || t('chatbox.errors.addToFavoritesError'));
          }
    
          const data = await response.json();
    
          // Check if the molecule was already in favorites
          if (data.message === "Molecule already in favorites") {
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { loading: false, success: t('chatbox.success.alreadyInFavorites'), error: null }
            }));
          } else {
            // Set success for this specific molecule
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { loading: false, success: t('chatbox.success.addedToFavorites'), error: null }
            }));
          }
    
          // Hide success message after 3 seconds
          setTimeout(() => {
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { ...prev[smiles], success: null }
            }));
          }, 3000);
    
        } catch (error) {
          console.error('Error adding to favorites:', error);
    
          // Set error for this specific molecule
          setMoleculeFavoriteStatus((prev: any) => ({
            ...prev,
            [smiles]: { loading: false, success: null, error: (error as any)?.message || t('chatbox.errors.addToFavoritesError') }
          }));
    
          // Hide error message after 3 seconds
          setTimeout(() => {
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { ...prev[smiles], error: null }
            }));
          }, 3000);
        }
    };

    useEffect(() => {
        fetchInitialData();
        fetchData();
    }, []);
    return (
        <MessageProvider>
            <FavoriteContext.Provider value={{ moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites }}>
                <Header />
                <div className='main-container'>
                    <Outlet />
                </div>
            </FavoriteContext.Provider>
        </MessageProvider>
    );
}

export default FullNavLayout;