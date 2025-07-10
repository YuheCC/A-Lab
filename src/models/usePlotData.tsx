import { create } from "zustand";
import { authFetch, getAPIUrl } from "@/utils";

const API_URL = getAPIUrl();

const MAX_NODES = 200000;

let initialData = false;
let isFetching = false; // 添加标志防止重复获取
let fetchDataCompleted = false; // 添加标志跟踪fetchData是否已完成

// 定义数据类型
interface PlotDataNode {
    id: string;
    x: number;
    y: number;
    smiles: string;
    properties: {
        molwt: number;
        homo_eV: number;
        lumo_eV: number;
        esp_min_eV: number;
        esp_max_eV: number;
        functional_groups: string;
        predicted_mp: number;
        predicted_bp: number;
        predicted_fp: number;
        chemical_formula: string;
        combustion_enthalpy: number;
        commercial_score: number;
        commercial_link: string;
        CLUSTER: string;
    };
    rawData: any;
}

interface PlotDataStore {
    loading: boolean;
    error: string | null;
    data: PlotDataNode[];
    fetchData: () => Promise<PlotDataNode[] | undefined>;
    fetchInitialData: () => Promise<PlotDataNode[] | undefined>;
}

/**
 * Zustand Datastore for Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 */
export const usePlotDataStore = create<PlotDataStore>((set, get) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        // 如果正在获取数据，则跳过
        if (isFetching) {
            return;
        }
        
        try {
            isFetching = true;
            set({ loading: true });
            const response = await authFetch(`${API_URL}/snowflake-query`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch data: ${response.statusText}` });
                return;
            }

            const data = await response.json();
            initialData = true;
            fetchDataCompleted = true; // 标记fetchData已完成

            // Map the data to our node structure with updated property names
            const nodes: PlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined && row.SMILES)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => ({
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
                error: null
            })
            return nodes;

        } catch (error: any) {
            set({
                loading: false,
                error: error.message
            })
        } finally {
            isFetching = false;
        }
    },
    fetchInitialData: async () => {
        // 如果正在获取数据，则跳过
        if (isFetching) {
            return;
        }
        
        try {
            set({ loading: true });
            const response = await authFetch(`/map-init.js`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch data: ${response.statusText}` });
                return;
            }

            const data = await response.json();
            
            // 如果fetchData已经完成，则忽略fetchInitialData的数据
            if (fetchDataCompleted) {
                console.log('fetchData already completed, ignoring fetchInitialData result');
                return;
            }
            
            initialData = true;

            // Map the data to our node structure with updated property names
            const nodes: PlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined && row.SMILES)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => ({
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
                error: null
            })
            return nodes;

        } catch (error: any) {
            set({
                loading: false,
                error: error.message
            })
        } finally {
            isFetching = false;
        }
    }
}))