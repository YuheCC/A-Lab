import { create } from "zustand";
import { authFetch, getAPIUrl } from "../utils";

const API_URL = getAPIUrl();

const MAX_NODES = 200000;

/**
 * Zustand Datastore for Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 */
export const usePlotDataStore = create((set, get) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        try {
            // set({ loading: true });
            const response = await authFetch(`${API_URL}/snowflake-query`);

            if (!response.ok) {
                // set({ loading: false });
                // throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();

            // Map the data to our node structure with updated property names
            const nodes = data.data
                .filter(row => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined && row.SMILES)
                .slice(0, MAX_NODES)
                .map((row, index) => ({
                    id: index.toString(),
                    x: Number(row.UMAP_0),
                    y: Number(row.UMAP_1),
                    smiles: row.SMILES,
                    properties: {
                        molwt: row.MOLECULAR_WEIGHT,
                        homo_eV: row.HOMO_EV,
                        lumo_eV: row.LUMO_EV,
                        esp_min_eV: row.ESP_MIN_EV,
                        esp_max_eV: row.ESP_MAX_EV,
                        functional_groups: row.FUNCTIONAL_GROUPS,
                        predicted_mp: row.PREDICTED_MP_CELSIUS,
                        predicted_bp: row.PREDICTED_BP_CELSIUS,
                        predicted_fp: row.PREDICTED_FP_CELSIUS,
                        chemical_formula: row.CHEMICAL_FORMULA,
                        combustion_enthalpy: row.COMBUSTION_ENTHALPY_EV,
                        commercial_score: row.COMMERCIAL_SCORE,
                        commercial_link: row.COMMERCIAL_LINK,
                        CLUSTER: row.CLUSTER.toString()
                    },
                    rawData: row
                }));

            set({
                data: nodes,
                loading: false,
            })
            return nodes;

        } catch (error) {
            set({
                // loading: false,
                // error: error.message
            })
        }
    },
    fetchInitialData: async () => {
        try {
            set({ loading: true });
            const response = await authFetch(`/map-init.js`);

            if(!get().loading) {
                return;
            }
            if (!response.ok) {
                set({ loading: false });
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();

            // Map the data to our node structure with updated property names
            const nodes = data.data
                .filter(row => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined && row.SMILES)
                .slice(0, MAX_NODES)
                .map((row, index) => ({
                    id: index.toString(),
                    x: Number(row.UMAP_0),
                    y: Number(row.UMAP_1),
                    smiles: row.SMILES,
                    properties: {
                        molwt: row.MOLECULAR_WEIGHT,
                        homo_eV: row.HOMO_EV,
                        lumo_eV: row.LUMO_EV,
                        esp_min_eV: row.ESP_MIN_EV,
                        esp_max_eV: row.ESP_MAX_EV,
                        functional_groups: row.FUNCTIONAL_GROUPS,
                        predicted_mp: row.PREDICTED_MP_CELSIUS,
                        predicted_bp: row.PREDICTED_BP_CELSIUS,
                        predicted_fp: row.PREDICTED_FP_CELSIUS,
                        chemical_formula: row.CHEMICAL_FORMULA,
                        combustion_enthalpy: row.COMBUSTION_ENTHALPY_EV,
                        commercial_score: row.COMMERCIAL_SCORE,
                        commercial_link: row.COMMERCIAL_LINK,
                        CLUSTER: row.CLUSTER.toString()
                    },
                    rawData: row
                }));

            set({
                data: nodes,
                loading: false,
            })
            return nodes;

        } catch (error) {
            set({
                loading: false,
                error: error.message
            })
        }
    }
}))