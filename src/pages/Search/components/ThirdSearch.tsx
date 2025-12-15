import React, { useEffect, useRef, useState } from 'react';
import { MaterialsInput } from '@materialsproject/mp-react-components';
import { useTranslation } from 'react-i18next';
import './third.css';
import { useAuthStore } from '@/models/useAuth';
import { PUBLIC_SEARCH_LOCKED_VALUES } from '@/constants/publicDefaults';
import { useAccessModals } from '@/hooks/useAccessModals';
import request from '@/services/request';
import { urlConfig } from '@/services/config/urlConfig';
import { getSearchEndpoint } from '@/services/search/endpoints';
import { buildAutoFetchURL } from '@/services/config/autoFetch';
import { authFetch } from '@/utils';

// 定义搜索结果的数据类型
interface SearchResult {
    [key: string]: any;
}

const ThirdSearch: React.FC<{ isPublicUser?: boolean }> = ({ isPublicUser = false }) => {
    const { t } = useTranslation();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isPublic = isPublicUser || (initialAuthLoaded && (!isAuthenticated || userPermissions === 'common'));
    const triggerAccessModal = useAccessModals();
    const [molecularFormula, setMolecularFormula] = useState<string>(
        isPublic ? PUBLIC_SEARCH_LOCKED_VALUES.sse.formulaInput : ''
    );
    const [activeTab, setActiveTab] = useState<'elements' | 'atLeastElements' | 'formula'>(
        isPublic ? PUBLIC_SEARCH_LOCKED_VALUES.sse.activeTab : 'atLeastElements'
    );
    useEffect(() => {
        if (!isPublic) return;
        setMolecularFormula(PUBLIC_SEARCH_LOCKED_VALUES.sse.formulaInput);
        setActiveTab(PUBLIC_SEARCH_LOCKED_VALUES.sse.activeTab);
    }, [isPublic]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [totalCount, setTotalCount] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);
    const [inputShow, setInputShow] = useState<boolean>(true);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null);

    const handleFormulaChange = (value: string) => {
        if (isPublic) {
            return;
        }
        setMolecularFormula(value);
    };

    const matchModelEnums = {
        "elements": "exact",
        "atLeastElements": "all",
        "formula": "formula"
    }

    const handleSearch = async () => {
        if (molecularFormula.trim()) {
            setIsLoading(true);
            setError('');
            setSearchResults([]);
            setCurrentPage(1); // 重置到第一页

            try {
                // Get environment-specific endpoint
                const env = urlConfig.getEnvironment();
                const endpoint = getSearchEndpoint(env, 'thirdSearch');
                const baseUrl = urlConfig.buildFullURL(endpoint);

                const params = new URLSearchParams({
                    query: molecularFormula.replace(/,/g, '-'),
                    match_mode: matchModelEnums[activeTab],
                    page: currentPage.toString(),
                    page_size: pageSize.toString(),
                });

                const response = await request(`${baseUrl}?${params.toString()}`, {
                    method: 'GET',
                });

                if ((response as any).ok === false || response.status >= 400) {
                    throw new Error(t('thirdSearch.searchRequestFailed', { status: response.status }));
                }

                const data = response.data;
                
                // 新的分页响应格式：data包含data和total_count
                if (data && data.data && Array.isArray(data.data)) {
                    setSearchResults(data.data);
                    setTotalCount(data.total_count || 0);
                } else if (data.results && Array.isArray(data.results)) {
                    // 兼容旧格式
                    setSearchResults(data.results);
                    setTotalCount(data.results.length);
                } else {
                    // 如果接口直接返回数组
                    const results = Array.isArray(data) ? data : [];
                    setSearchResults(results);
                    setTotalCount(results.length);
                }
                
            } catch (err: any) {
                console.error(t('thirdSearch.searchErrorWithDetails', { error: err instanceof Error ? err.message : 'Unknown error' }), err);

                // 检查是否是未登录错误（401）或者token不存在
                const token = localStorage.getItem('token');
                const isUnauthorized = err?.response?.status === 401 || err?.status === 401;

                if (!token || isUnauthorized) {
                    // 未登录或401错误时不显示错误信息
                    setError('');
                } else {
                    // 已登录且非401错误时显示错误信息
                    const fallbackMessage = t('thirdSearch.searchError');
                    setError(err instanceof Error && err.message ? err.message : fallbackMessage);
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isPublic) {
            return;
        }
        setMolecularFormula(e.target.value);
    };

    // 容器样式
    const containerStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        minHeight: '100vh'
    };

    // 顶部说明条样式
    const headerBannerStyle: React.CSSProperties = {
        backgroundColor: '#e8e8e8',
        padding: '12px 20px',
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
        borderBottom: '1px solid #ddd'
    };

    // 搜索栏样式
    const searchBarStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #ddd',
        justifyContent: 'center'
    };

     const materialsButtonStyle: React.CSSProperties = {
         backgroundColor: '#f8f9fa',
         border: '1px solid #ddd',
         borderRadius: '4px',
         padding: '8px 16px',
         fontSize: '14px',
         color: '#555',
         cursor: 'pointer',
         fontWeight: '500'
     };

    // 自定义输入框样式，完全覆盖库的样式
    const customInputStyle: React.CSSProperties = {
        flex: 1,
        maxWidth: '400px',
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        backgroundColor: 'white',
        outline: 'none',
        fontFamily: 'inherit'
    };

    const iconButtonStyle: React.CSSProperties = {
        width: '36px',
        height: '36px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: '#666'
    };

    const searchButtonStyle: React.CSSProperties = {
        backgroundColor: '#5cb85c',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 20px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: '500',
        opacity: isLoading ? 0.7 : 1,
        pointerEvents: isLoading ? 'none' : 'auto'
    };

    // 主要内容区域
    const mainContentStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '20px',
        margin: '0px 0px 0px 0px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    };

    // 标签页样式
    const tabContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px'
    };

    const tabStyle: React.CSSProperties = {
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '20px',
        padding: '8px 16px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#666',
        fontWeight: '500'
    };

    const activeTabStyle: React.CSSProperties = {
        ...tabStyle,
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff'
    };

    // MaterialsInput容器样式，用于隐藏库自带的输入框
    const materialsInputContainerStyle: React.CSSProperties = {
        marginTop: '20px',
        width: '60%'
    };

    // 分页相关计算 - 使用服务器端总数
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPageData = searchResults; // 服务器已返回当前页数据

    const sseColumnMap: { [key: string]: string } = {
        'SSE_ID': 'SSEId',
        'FORMULA': 'Formula',
        'INTEGER_FORMULA': 'IntegerFormula',
        'CHEMICAL_SYSTEM': 'ChemicalSystem',
        'ABBREVIATION': 'Abbreviation',
        'PHASE': 'Phase',
        'FRAMEWORK': 'Framework',
        'POLYMORPH': 'Polymorph',
        'SPACEGROUP_SYMBOL': 'SpacegroupSymbol',
        'ELECTROLYTE_CHEMISTRY': 'ElectrolyteChemistry',
        'IONIC_CONDUCTIVITY': 'IonicConductivity (S/cm)',
        'CONDUCTIVITY_TEMPERATURE': 'ConductivityTemperature (°C)',
        'ACTIVATION_ENERGY': 'ActivationEnergy (eV)',
        'ELECTROCHEMICAL_WINDOW': 'ElectrochemicalWindow (V)',
        'DOI': 'Doi',
        'ELECTROLYTE_NAME': 'ElectrolyteName',
        'LATTICE_PARAMETER_A': 'LatticeParameterA (Å)',
        'LATTICE_PARAMETER_B': 'LatticeParameterB (Å)',
        'LATTICE_PARAMETER_C': 'LatticeParameterC (Å)',
        'IONIC_CONDUCTIVITY_TEMPERATURE_C': 'IonicConductivityTemperatureC',
        'IONIC_CONDUCTIVITY_METHOD': 'IonicConductivityMethod',
        'RELATIVE_DENSITY_PERCENT': 'RelativeDensityPercent',
        'ELECTROCHEMICAL_WINDOW_MEASUREMENT_CONTEXT': 'ElectrochemicalWindowMeasurementContext',
        'THERMAL_STABILITY_VALUE': 'ThermalStabilityValue',
        'THERMAL_STABILITY_SOURCE_TYPE': 'ThermalStabilitySourceType',
        'MECHANICAL_STABILITY_VALUE': 'MechanicalStabilityValue',
        'MECHANICAL_STABILITY_SOURCE_TYPE': 'MechanicalStabilitySourceType',
        'BATTERY_SYSTEM': 'BatterySystem',
        'BATTERY_TYPE': 'BatteryType',
        'BATTERY_CONFIGURATION': 'BatteryConfiguration',
        'CATHODE': 'Cathode',
        'ANODE': 'Anode',
        'CUT_OFF_VOLTAGE': 'CutOffVoltage',
        'C_RATE': 'CRate',
        'CELL_TEST_TEMPERATURE': 'CellTestTemperature',
        'CYCLES': 'Cycles',
        'RETENTION': 'Retention',
        'CE': 'CE'
      };

    // 默认显示的列
    const defaultDisplayColumns = [
        'sse_id',
        'formula',
        'integer_formula',
        'chemical_system',
        'abbreviation',
        'phase',
        'framework',
        'polymorph',
        'ionic_conductivity',
        'conductivity_temperature',
        'activation_energy',
        'electrochemical_window'
    ];

    // 获取要显示的表头列（仅默认列）
    const getTableHeaders = (): string[] => {
        if (searchResults.length === 0) return [];
        
        // 获取第一条数据的所有键
        const firstResult = searchResults[0];
        const allKeys = Object.keys(firstResult);
        
        // 创建小写映射用于比较
        const lowerCaseKeysMap = new Map<string, string>();
        allKeys.forEach(key => {
            lowerCaseKeysMap.set(key.toLowerCase(), key);
        });
        
        // 筛选出存在的默认列（小写比较，返回实际key）
        const availableDefaultColumns = defaultDisplayColumns
            .map(col => lowerCaseKeysMap.get(col.toLowerCase()))
            .filter(Boolean) as string[];
        
        // 仅返回默认列
        return availableDefaultColumns;
    };


    // 获取所有可用的列（用于详情弹窗）
    const getAllAvailableColumns = (): string[] => {
        if (searchResults.length === 0) return [];
        return Object.keys(searchResults[0]);
    };

    // 分页处理函数 - 重新请求数据
    const handlePageChange = async (page: number) => {
        if (page === currentPage) return;
        
        setCurrentPage(page);
        setIsLoading(true);
        setError('');
        
        try {
            const sseUrl = buildAutoFetchURL('sseSearch');
            const response = await authFetch(`${sseUrl}?query=${encodeURIComponent(molecularFormula.replace(/,/g, '-'))}&match_mode=${matchModelEnums[activeTab]}&page=${page}&page_size=${pageSize}`);
            
            if (!response.ok) {
                await raiseResponseError(response, t('thirdSearch.searchRequestFailed', { status: response.status }));
            }
            
            const data = await response.json();
            
            // 新的分页响应格式：data包含data和total_count
            if (data && data.data && Array.isArray(data.data)) {
                setSearchResults(data.data);
                setTotalCount(data.total_count || 0);
            } else if (data.results && Array.isArray(data.results)) {
                // 兼容旧格式
                setSearchResults(data.results);
                setTotalCount(data.results.length);
            } else {
                // 如果接口直接返回数组
                const results = Array.isArray(data) ? data : [];
                setSearchResults(results);
                setTotalCount(results.length);
            }
            
            // 滚动到表格顶部
            const container = document.querySelector('.third-search-container-new');
            if (container) {
                window.scrollTo({
                    top: (container as HTMLElement).offsetTop,
                    behavior: 'smooth'
                });
            }
            
        } catch (err: any) {
            console.error(t('thirdSearch.searchErrorWithDetails', { error: err instanceof Error ? err.message : 'Unknown error' }), err);

            // 检查是否是未登录错误（401）或者token不存在
            const token = localStorage.getItem('token');
            const isUnauthorized = err?.response?.status === 401 || err?.status === 401;

            if (!token || isUnauthorized) {
                // 未登录或401错误时不显示错误信息
                setError('');
            } else {
                // 已登录且非401错误时显示错误信息
                const fallbackMessage = t('thirdSearch.searchError');
                setError(err instanceof Error && err.message ? err.message : fallbackMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // 触发对应索引的li元素点击事件的函数
    const triggerLiClick = (index: number) => {
        if (isPublic) {
            triggerAccessModal();
            return;
        }
        setTimeout(() => {
            const modeSwitcher = ref.current?.querySelector('.mpc-pt-mode-switcher');
            if (modeSwitcher) {
                const ul = modeSwitcher.querySelector('ul');
                if (ul) {
                    const liElements = ul.querySelectorAll('li');
                    console.log('liElements', liElements);
                    if (liElements[index]) {
                        (liElements[index] as HTMLElement)?.querySelector('a')?.click();
                    }
                }
            }
        }, 100);
    };

    // 搜索结果表格样式
    const resultsContainerStyle: React.CSSProperties = {
        width: '100%',
        marginTop: '20px'
    };

    const tableWrapperStyle: React.CSSProperties = {
        width: '100%',
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const tableStyle: React.CSSProperties = {
        minWidth: '800px', // 设置最小宽度确保有横向滚动
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        borderRadius: '8px'
    };

    const thStyle: React.CSSProperties = {
        backgroundColor: '#f8f9fa',
        padding: '12px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        fontWeight: '600',
        color: '#333',
        whiteSpace: 'nowrap', // 防止表头换行
        minWidth: '120px' // 设置最小列宽
    };

    const tdStyle: React.CSSProperties = {
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        color: '#555',
        whiteSpace: 'nowrap', // 防止内容换行
        minWidth: '120px' // 设置最小列宽
    };

    const loadingStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '20px',
        color: '#666'
    };

    const errorStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '20px',
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        margin: '10px 0'
    };

const noResultsStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#666',
    fontSize: '16px',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px dashed #dee2e6',
    margin: '40px 0',
    lineHeight: '1.6'
};

    // 分页组件样式
    const paginationContainerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '20px',
        padding: '16px'
    };

    const paginationButtonStyle: React.CSSProperties = {
        padding: '8px 12px',
        border: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#555',
        minWidth: '40px',
        textAlign: 'center'
    };

    const activePageButtonStyle: React.CSSProperties = {
        ...paginationButtonStyle,
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff'
    };

    const disabledButtonStyle: React.CSSProperties = {
        ...paginationButtonStyle,
        opacity: 0.5,
        cursor: 'not-allowed'
    };

    const pageInfoStyle: React.CSSProperties = {
        fontSize: '14px',
        color: '#666',
        margin: '0 16px'
    };


    // 模态框样式
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalContentStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0',
        maxWidth: '1200px',
        maxHeight: '85vh',
        width: '95%',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.1)',
        transform: 'scale(1)',
        animation: 'modalSlideIn 0.3s ease-out'
    };

    const modalHeaderStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        margin: '0'
    };

    const modalTitleStyle: React.CSSProperties = {
        margin: 0,
        color: '#2c3e50',
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const modalCloseButtonStyle: React.CSSProperties = {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#6c757d',
        padding: '4px',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    };

    const modalBodyStyle: React.CSSProperties = {
        padding: '24px',
        maxHeight: '70vh',
        overflow: 'auto',
        backgroundColor: 'white'
    };

    const detailGridStyle: React.CSSProperties = {
        display: 'grid',
        gap: '16px'
    };

    const detailItemStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        transition: 'all 0.2s ease'
    };

    const detailLabelStyle: React.CSSProperties = {
        fontWeight: '600',
        color: '#495057',
        fontSize: '14px',
        lineHeight: '1.4',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '2px'
    };

    const detailValueStyle: React.CSSProperties = {
        color: '#6c757d',
        fontSize: '14px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        backgroundColor: '#f8f9fa',
        padding: '8px 12px',
        borderRadius: '6px',
        fontFamily: 'Monaco, "Lucida Console", monospace',
        border: '1px solid #e9ecef'
    };

    const iconStyle: React.CSSProperties = {
        width: '20px',
        height: '20px',
        fill: '#007bff'
    };

    return (
        <>
            <div style={containerStyle} className="third-search-container-new">
                {/* 顶部说明条 */}
                

                {/* 搜索栏 */}
                <div style={searchBarStyle}>
                    <button
                        type="button"
                        style={{
                            ...materialsButtonStyle,
                            opacity: isPublic ? 0.6 : 1,
                            cursor: isPublic ? 'not-allowed' : materialsButtonStyle?.cursor || 'pointer',
                        }}
                        onClick={(event) => {
                            if (isPublic) {
                                event.preventDefault();
                                triggerAccessModal();
                            }
                        }}
                        aria-disabled={isPublic}
                    >
                        {t('thirdSearch.materialsButton')}
                    </button>
                    
                    {/* 自定义输入框，替代库的输入框 */}
                    <input
                        style={{
                            ...customInputStyle,
                            backgroundColor: isPublic ? '#f0f0f0' : customInputStyle.backgroundColor,
                            cursor: isPublic ? 'not-allowed' : 'text',
                        }}
                        value={molecularFormula}
                        onChange={handleInputChange}
                        readOnly={isPublic}
                        placeholder=""
                        onMouseDown={(event) => {
                            if (isPublic) {
                                event.preventDefault();
                                triggerAccessModal();
                            }
                        }}
                        onFocus={(event) => {
                            if (isPublic) {
                                event.target.blur();
                                triggerAccessModal();
                            }
                        }}
                    />

                    <button
                        style={{
                            ...iconButtonStyle,
                            opacity: isPublic ? 0.5 : 1,
                            cursor: isPublic ? 'not-allowed' : iconButtonStyle.cursor,
                        }}
                        title={t('thirdSearch.periodicTableTooltip')}
                        onClick={() => {
                            if (isPublic) {
                                triggerAccessModal();
                                return;
                            }
                            setInputShow(!inputShow);
                        }}
                        aria-disabled={isPublic}
                    >
                        <div style={{ 
                            width: '16px', 
                            height: '12px', 
                            backgroundColor: '#007bff',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1px'
                        }}>
                            {[...Array(12)].map((_, i) => (
                                <div key={i} style={{
                                    width: '2px',
                                    height: '2px',
                                    backgroundColor: 'white'
                                }} />
                            ))}
                        </div>
                    </button>
                    
                    <button style={searchButtonStyle} onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? t('thirdSearch.searchButtonLoading') : t('thirdSearch.searchButton')}
                    </button>
                </div>

                {/* 主要内容 */}
                <div style={mainContentStyle}>
                    {/* 标签页 */}
                    {
                        inputShow && (
                            <>
                                <div style={tabContainerStyle}>
                                    <button 
                                        style={{
                                            ...(activeTab === 'elements' ? activeTabStyle : tabStyle),
                                            opacity: isPublic ? 0.5 : 1,
                                            cursor: isPublic ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={() => {
                                            setActiveTab('elements');
                                            if (!isPublic) {
                                                triggerLiClick(0);
                                            }
                                        }}
                                        aria-disabled={isPublic}
                                    >
                                        {t('thirdSearch.tabs.onlyElements')}
                                    </button>
                                    <button 
                                        style={{
                                            ...(activeTab === 'atLeastElements' ? activeTabStyle : tabStyle),
                                            opacity: isPublic ? 0.5 : 1,
                                            cursor: isPublic ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={() => {
                                            setActiveTab('atLeastElements');
                                            if (!isPublic) {
                                                triggerLiClick(1);
                                            }
                                        }}
                                        aria-disabled={isPublic}
                                    >
                                        {t('thirdSearch.tabs.atLeastElements')}
                                    </button>
                                    <button 
                                        style={{
                                            ...(activeTab === 'formula' ? activeTabStyle : tabStyle),
                                            opacity: isPublic ? 1 : 1,
                                            cursor: isPublic ? 'default' : 'pointer',
                                        }}
                                        onClick={() => {
                                            if (activeTab === 'formula') return;
                                            setActiveTab('formula');
                                            if (!isPublic) {
                                                triggerLiClick(2);
                                            }
                                        }}
                                    >
                                        {t('thirdSearch.tabs.formula')}
                                    </button>
                                </div>

                                {/* MaterialsInput组件 - 通过CSS隐藏输入框，只显示周期表 */}
                                <div
                                    ref={ref}
                                    style={{
                                        ...materialsInputContainerStyle,
                                        opacity: isPublic ? 0.5 : 1,
                                    }}
                                    className="materials-input-container"
                                    onClick={() => {
                                        if (isPublic) {
                                            triggerAccessModal();
                                        }
                                    }}
                                >
                                    <div style={{ pointerEvents: isPublic ? 'none' : 'auto' }}>
                                        <MaterialsInput
                                            value={molecularFormula}
                                            onChange={handleFormulaChange}
                                            placeholder=""
                                            label=""
                                            allowedInputTypes={['formula', 'elements', 'chemical_system']}
                                            periodicTableMode="toggle"
                                            showTypeDropdown={false}
                                            showSubmitButton={false}
                                        />
                                    </div>
                                </div>
                             </>
                         )
                     }   

                    {/* 搜索结果展示区域 */}
                    <div style={resultsContainerStyle}>
                        {/* 加载状态 */}
                        {isLoading && (
                            <div style={loadingStyle}>
                                <div>{t('thirdSearch.loadingMessage')}</div>
                            </div>
                        )}

                        {/* 错误信息 */}
                        {error && (
                            <div style={errorStyle}>
                                {error}
                            </div>
                        )}

                        {/* 搜索结果表格 */}
                        {!isLoading && !error && searchResults.length > 0 && (
                            <div style={tableWrapperStyle}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr>
                                            {getTableHeaders().map((header) => (
                                                <th key={header} style={thStyle}>
                                                    {sseColumnMap[header]}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPageData.map((result, index) => (
                                            <tr key={index}>
                                                {getTableHeaders().map((header) => {
                                                    const isClickableColumn = ['SSE_ID', 'FORMULA', 'INTEGER_FORMULA'].includes(header);
                                                    const cellStyle = isClickableColumn ? { ...tdStyle, cursor: 'pointer', color: '#007bff', textDecoration: 'underline' } : tdStyle;
                                                    console.log(header, isClickableColumn);
                                                    return (
                                                        <td 
                                                            key={header} 
                                                            style={cellStyle}
                                                            onClick={isClickableColumn ? () => {
                                                                setSelectedRecord(result);
                                                                setShowDetailModal(true);
                                                            } : undefined}
                                                        >
                                                            {typeof result[header] === 'object' && result[header] !== null
                                                                ? JSON.stringify(result[header])
                                                                : String(result[header] || t('thirdSearch.noData'))
                                                            }
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 分页组件 */}
                        {!isLoading && !error && searchResults.length > 0 && totalPages > 1 && (
                            <div style={paginationContainerStyle}>
                                {/* 上一页按钮 */}
                                <button
                                    style={currentPage === 1 ? disabledButtonStyle : paginationButtonStyle}
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    {t('thirdSearch.previousPage')}
                                </button>

                                {/* 页码信息 */}
                                <div style={pageInfoStyle}>
                                    {t('thirdSearch.pageInfo', { current: currentPage, total: totalPages })} ({t('thirdSearch.totalItems', { count: totalCount })})
                                </div>

                                 {/* 页码按钮 */}
                                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                     let pageNum;
                                     if (totalPages <= 5) {
                                         pageNum = i + 1;
                                     } else if (currentPage <= 3) {
                                         pageNum = i + 1;
                                     } else if (currentPage >= totalPages - 2) {
                                         pageNum = totalPages - 4 + i;
                                     } else {
                                         pageNum = currentPage - 2 + i;
                                     }

                                     return (
                                         <button
                                             key={pageNum}
                                             style={currentPage === pageNum ? activePageButtonStyle : paginationButtonStyle}
                                             onClick={() => handlePageChange(pageNum)}
                                         >
                                             {pageNum}
                                         </button>
                                     );
                                 })}

                                {/* 下一页按钮 */}
                                <button
                                    style={currentPage === totalPages ? disabledButtonStyle : paginationButtonStyle}
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    {t('thirdSearch.nextPage')}
                                </button>
                            </div>
                        )}

                        {/* 无搜索结果 */}
                        {!isLoading && !error && searchResults.length === 0 && molecularFormula.trim() !== '' && (
                            <div style={noResultsStyle}>
                                {t('thirdSearch.noExperimentalData')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 详情弹窗 */}
            {showDetailModal && selectedRecord && (
                <div style={modalOverlayStyle} onClick={() => setShowDetailModal(false)}>
                    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h3 style={modalTitleStyle}>
                                <svg style={iconStyle} viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-9 9z"/>
                                </svg>
                                {t('thirdSearch.materialDetails')}
                            </h3>
                            <button 
                                style={modalCloseButtonStyle}
                                onClick={() => setShowDetailModal(false)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e9ecef';
                                    e.currentTarget.style.color = '#495057';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6c757d';
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={modalBodyStyle}>
                            <div style={detailGridStyle}>
                                {getAllAvailableColumns().map((key) => (
                                    <div key={key} style={detailItemStyle}>
                                        <div style={detailLabelStyle}>{sseColumnMap[key]}</div>
                                        <div style={detailValueStyle}>
                                            {typeof selectedRecord[key] === 'object' && selectedRecord[key] !== null
                                                ? JSON.stringify(selectedRecord[key], null, 2)
                                                : String(selectedRecord[key] || t('thirdSearch.noData'))
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ThirdSearch;
