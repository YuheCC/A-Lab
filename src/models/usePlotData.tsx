import { create } from "zustand";
import { authFetch, getAPIUrl } from "@/utils";

const API_URL = getAPIUrl();

const MAX_NODES = 210000;

let initialData = false;
let isFetching = false; // 添加标志防止重复获取
let fetchDataCompleted = false; // 添加标志跟踪fetchData是否已完成

// 定义数据类型
interface BasePlotDataProperties {
    molwt?: number;
    homo_eV?: number;
    lumo_eV?: number;
    esp_min_eV?: number;
    esp_max_eV?: number;
    functional_groups?: string;
    predicted_mp?: number;
    predicted_bp?: number;
    predicted_fp?: number;
    chemical_formula?: string;
    combustion_enthalpy?: number;
    commercial_score?: number;
    commercial_link?: string;
    CLUSTER: string | null;
}

interface InorganicPlotDataProperties extends BasePlotDataProperties {}

interface AnionsPlotDataProperties extends BasePlotDataProperties {
    vdw_volume_angstroms3?: number;
    fluoride_bde_ev?: number;
}

interface PlotDataNode<P extends BasePlotDataProperties = BasePlotDataProperties> {
    id: string;
    x: number;
    y: number;
    smiles: string;
    cation?: string;
    casrn?: string;
    hasFullData: boolean;
    properties: P;
    rawData: any;
}

type OrganicPlotDataNode = PlotDataNode<BasePlotDataProperties>;
type InorganicPlotDataNode = PlotDataNode<InorganicPlotDataProperties>;
type AnionsPlotDataNode = PlotDataNode<AnionsPlotDataProperties>;

interface PlotDataStore {
    loading: boolean;
    error: string | null;
    data: OrganicPlotDataNode[];
    fetchData: () => Promise<OrganicPlotDataNode[] | undefined>;
    fetchInitialData: () => Promise<OrganicPlotDataNode[] | undefined>;
}

interface InorganicPlotDataStore {
    loading: boolean;
    error: string | null;
    data: InorganicPlotDataNode[];
    fetchData: () => Promise<InorganicPlotDataNode[] | undefined>;
}

interface AnionsPlotDataStore {
    loading: boolean;
    error: string | null;
    data: AnionsPlotDataNode[];
    fetchData: () => Promise<AnionsPlotDataNode[] | undefined>;
    fetchInitialData: () => Promise<AnionsPlotDataNode[] | undefined>;
}

const handleCluster = (cluster: any) => {
    if(cluster === null || cluster === undefined || cluster === ''){
        return null;
    }
    if(typeof cluster === 'string'){
        return cluster;
    }
    if(typeof cluster === 'number' && cluster >= 0){
        cluster += 1;
        return cluster.toString();
    }
    return cluster.toString();
}

const createOrganicNode = (row: any, index: number): OrganicPlotDataNode => {
    const hasFullData = Boolean(row?.SMILES);

    return {
        id: (row?.ID ?? row?.id ?? index).toString(),
        x: Number(row.UMAP_0),
        y: Number(row.UMAP_1),
        smiles: row.SMILES ?? '',
        cation: row?.cation ?? row?.CATION ?? undefined,
        casrn: row?.CASRN ?? row?.casrn ?? undefined,
        hasFullData,
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
            CLUSTER: handleCluster(row.CLUSTER)
        },
        rawData: row
    };
};

const createInorganicNode = (row: any, index: number): InorganicPlotDataNode => {
    const hasFullData = Boolean(row?.SMILES);

    return {
        id: (row?.ID ?? row?.id ?? index).toString(),
        x: Number(row.UMAP_0),
        y: Number(row.UMAP_1),
        smiles: row.SMILES ?? '',
        cation: row?.cation ?? row?.CATION ?? undefined,
        casrn: row?.CASRN ?? row?.casrn ?? undefined,
        hasFullData,
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
            CLUSTER: handleCluster(row.CLUSTER)
        },
        rawData: row
    };
};

const createAnionsNode = (row: any, index: number): AnionsPlotDataNode => {
    const hasFullData = Boolean(row?.SMILES);

    return {
        id: (row?.ID ?? row?.id ?? index).toString(),
        x: Number(row.UMAP_0),
        y: Number(row.UMAP_1),
        smiles: row.SMILES ?? '',
        cation: row?.cation ?? row?.CATION ?? undefined,
        casrn: row?.CASRN ?? row?.casrn ?? undefined,
        hasFullData,
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
            vdw_volume_angstroms3: row.VDW_VOLUME_ANGSTROMS3,
            fluoride_bde_ev: row.FLUORIDE_BDE_EV,
            CLUSTER: handleCluster(row.CLUSTER)
        },
        rawData: row
    };
};

/**
 * Zustand Datastore for Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 */
export const usePlotDataStore = create<PlotDataStore>((set) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        // 如果正在获取数据，则跳过
        if (isFetching || fetchDataCompleted) {
            return;
        }
        
        try {
            isFetching = true;
            set({ loading: true });
            const response = await authFetch(`${API_URL}/snowflake-query?umap_type=organic`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch data: ${response.statusText}` });
                return;
            }

            const data = await response.json();
            initialData = true;
            fetchDataCompleted = true; // 标记fetchData已完成

            // Map the data to our node structure with updated property names
            const nodes: OrganicPlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => createOrganicNode(row, index));

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
            const nodes: OrganicPlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => createOrganicNode(row, index));

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

/**
 * Zustand Datastore for Inorganic Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 * - Temporarily uses organic molecule interface until inorganic interface is implemented
 */
export const useInorganicPlotDataStore = create<InorganicPlotDataStore>((set) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        try {
            set({ loading: true });
            // 暂时使用有机分子的接口，直到无机分子接口实现
            const response = await authFetch(`${API_URL}/snowflake-query?is_inorganic=true&umap_type=inorganic`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch inorganic data: ${response.statusText}` });
                return;
            }

            const data = await response.json();

            // Map the data to our node structure with updated property names
            const nodes: InorganicPlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => createInorganicNode(row, index));

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
        }
    }
}))

// 添加 anions 的状态管理变量
let anionsInitialData = false;
let anionsIsFetching = false;
let anionsFetchDataCompleted = false;

/**
 * Zustand Datastore for Anions Plot Data
 * - Indicates if the plot data is loading/errored
 * - Can be used across the app in all components
 */
export const useAnionsPlotDataStore = create<AnionsPlotDataStore>((set) => ({

    loading: false,
    error: null,
    data: [],

    fetchData: async () => {
        // 如果正在获取数据或已经完成，则跳过
        if (anionsIsFetching || anionsFetchDataCompleted) {
            return;
        }

        try {
            anionsIsFetching = true;
            set({ loading: true });
            const response = await authFetch(`${API_URL}/snowflake-query?is_anions=true&umap_type=anions`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch anions data: ${response.statusText}` });
                return;
            }

            const data = await response.json();
            anionsInitialData = true;
            anionsFetchDataCompleted = true; // 标记fetchData已完成

            // Map the data to our node structure with updated property names
            const nodes: AnionsPlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => createAnionsNode(row, index));

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
            anionsIsFetching = false;
        }
    },
    fetchInitialData: async () => {
        // 如果正在获取数据，则跳过
        if (anionsIsFetching) {
            return;
        }

        try {
            set({ loading: true });
            const response = await authFetch(`/map-init-anions.js`);

            if (!response.ok) {
                set({ loading: false, error: `Failed to fetch data: ${response.statusText}` });
                return;
            }

            const data = await response.json();

            // 如果fetchData已经完成，则忽略fetchInitialData的数据
            if (anionsFetchDataCompleted) {
                console.log('fetchData already completed, ignoring fetchInitialData result');
                return;
            }

            anionsInitialData = true;

            // Map the data to our node structure with updated property names
            const nodes: AnionsPlotDataNode[] = data.data
                .filter((row: any) => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined)
                .slice(0, MAX_NODES)
                .map((row: any, index: number) => createAnionsNode(row, index));

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
            anionsIsFetching = false;
        }
    }
}))
