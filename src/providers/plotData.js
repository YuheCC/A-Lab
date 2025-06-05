import { create } from "zustand";
import { authFetch } from "../utils";

const API_URL = process.env.REACT_APP_API_URL;

const MAX_NODES = 23000;

/**
 * Zustand Datastore for Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 */
export const usePlotDataStore = create((set) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        try {
            set({ loading: true });
            const response = await authFetch(`${API_URL}/snowflake-query`);

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
                        predicted_mp: row.PREDICTED_MP,
                        predicted_bp: row.PREDICTED_BP,
                        chemical_formula: row.CHEMICAL_FORMULA,
                        CLUSTER: row.CLUSTER
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