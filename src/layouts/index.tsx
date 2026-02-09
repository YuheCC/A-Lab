import { Outlet, useLocation } from "umi";
import Header from "@/components/Header";
import { useEffect, useState, createContext } from "react";
// import "./index.less";
import { useTranslation } from "react-i18next";
import { COMMERCIAL_SCORE_MAP } from "@/utils";
import { authFetch, getAPIUrl } from "@/utils";
import { buildAutoFetchURL } from "@/services/config/autoFetch";
import { useAuthStore } from "@/models/useAuth";
import { MessageProvider, useMessage } from "@/components/MessageProvider";
import PricingOverlay from "@/components/PricingOverlay";
import { usePageCleanup } from "@/hooks/usePageCleanup";
import { VERIFY_AUTH_PARAM } from "@/hooks/useAuthNavigate";
import { LoginModalProvider, useLoginModalContext } from "@/components/LoginModal/context";
import LoginModal from "@/components/LoginModal";
import { setGlobalPricingModalHandler, resetGlobalPricingModalHandler } from "@/utils/authHelpers";
import ErrorBoundary from "@/components/ErrorBoundary";

const API_URL = getAPIUrl();

export const FavoriteContext = createContext<any>(null);
export const PricingContext = createContext<any>(null);

const FullNavLayoutInner = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const isChatPage = pathname.includes('/chat') || pathname.includes('/ask');
    const isPredictPage = pathname.includes('/predict');
    const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState<any>({});
    const { t, i18n } = useTranslation();
    const { verifyAuth } = useAuthStore();
    const language = i18n.language;
    const message = useMessage();
    const { isOpen: isLoginModalOpen, redirectPath, closeLoginModal, onLogin, setOnLogin } = useLoginModalContext();
    // 从query获取showPricing参数
    const queryParams = new URLSearchParams(window.location.search);
    const showPricingFromQuery = queryParams.get('showPricing') === 'true';
    const permissionFromQuery = queryParams.get('permission');
    const [showPricingOverlay, setShowPricingOverlay] = useState(showPricingFromQuery);
    const [permission, setPermission] = useState(permissionFromQuery);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // 使用页面清理hook
    usePageCleanup(pathname);

    useEffect(() => {
        verifyAuth();
    }, []);

    // 监听导航参数，检测 _verifyAuth 触发身份验证
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.has(VERIFY_AUTH_PARAM)) {
            verifyAuth();
            // 清理 URL 中的 _verifyAuth 参数，避免刷新时重复触发
            searchParams.delete(VERIFY_AUTH_PARAM);
            const cleanSearch = searchParams.toString();
            const cleanUrl = pathname + (cleanSearch ? `?${cleanSearch}` : '') + (location.hash || '');
            window.history.replaceState(null, '', cleanUrl);
        }
    }, [pathname, location.search]);

    // 定义登录成功后的回调函数
    const handleLoginSuccess = () => {
        // 重新验证身份
        // verifyAuth();

        // 如果在预测页面，刷新数据
        if (isPredictPage || true) {
            // 刷新页面数据，触发组件重新渲染
            window.location.reload();
        }

        // 如果需要，可以在这里添加更多刷新逻辑
        // 例如重新获取用户数据、权限等
    };

    // 设置登录成功回调
    useEffect(() => {
        setOnLogin(handleLoginSuccess);
    }, [setOnLogin, isPredictPage]);

    // 设置全局 pricing 浮层处理函数
    useEffect(() => {
        const openPricingModal = (permission?: string | null) => {
            setPermission(permission ?? null);
            setShowPricingOverlay(true);
        };

        setGlobalPricingModalHandler(openPricingModal);

        return () => {
            resetGlobalPricingModalHandler();
        };
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
            const msg = t('chatbox.errors.loginRequired');
            message.error(msg);
            throw new Error(msg);
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
    
          const favoritesUrl = buildAutoFetchURL('favorites');
          const response = await authFetch(favoritesUrl, {
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
            message.info(t('chatbox.success.alreadyInFavorites'));
          } else {
            // Set success for this specific molecule
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { loading: false, success: t('chatbox.success.addedToFavorites'), error: null }
            }));
            message.success(t('chatbox.success.addedToFavorites'));
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
          message.error((error as any)?.message || t('chatbox.errors.addToFavoritesError'));
    
          // Hide error message after 3 seconds
          setTimeout(() => {
            setMoleculeFavoriteStatus((prev: any) => ({
              ...prev,
              [smiles]: { ...prev[smiles], error: null }
            }));
          }, 3000);
        }
    };

    const getMainContainerClassName = () => {
        if (isChatPage) {
            return 'main-container chat-container';
        }
        if (isPredictPage) {
            return 'main-container predict-container';
        }
        if (pathname.startsWith('/formulate') || pathname.startsWith('/design')) {
            return 'main-container formulation-container';
        }

        if (pathname.startsWith('/manufacturing')) {
            return 'main-container manufacturing-container';
        }
        return 'main-container';
    }
    return (
        <PricingContext.Provider
          value={{
            showPricingOverlay,
            setShowPricingOverlay,
            permission,
            setPermission,
            showUpgradeModal,
            setShowUpgradeModal,
          }}
        >
          <FavoriteContext.Provider value={{ moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <Header />
                <ErrorBoundary>
                  <div
                    className={`${getMainContainerClassName()} ${language}-page`}
                  >
                      <Outlet />
                  </div>
                </ErrorBoundary>
              </div>
              <PricingOverlay
                  visible={showPricingOverlay}
                  onClose={() => {
                    setShowPricingOverlay(false)
                    setPermission(null)
                  }}
                  permission={permission}
              />
              <LoginModal
                  isOpen={isLoginModalOpen}
                  onClose={closeLoginModal}
                  redirectPath={redirectPath}
                  onLogin={onLogin}
              />
          </FavoriteContext.Provider>
        </PricingContext.Provider>
    );
}

const FullNavLayout = () => {
    return (
        <MessageProvider>
            <LoginModalProvider>
                <FullNavLayoutInner />
            </LoginModalProvider>
        </MessageProvider>
    );
}

export default FullNavLayout;
