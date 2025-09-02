import React, { useRef, useState } from 'react';
import { MaterialsInput } from '@materialsproject/mp-react-components';
import './third.css';
import { authFetch, getAPIUrl } from '@/utils';

const BASE_URL = getAPIUrl();

// 定义搜索结果的数据类型
interface SearchResult {
    [key: string]: any;
}

const ThirdSearch: React.FC = () => {
    const [molecularFormula, setMolecularFormula] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'elements' | 'atLeastElements' | 'formula'>('atLeastElements');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const ref = useRef<HTMLDivElement>(null);
    const [inputShow, setInputShow] = useState<boolean>(true);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null);

    const handleFormulaChange = (value: string) => {
        setMolecularFormula(value);
    };

    const matchModelEnums = {
        "elements": "exact",
        "atLeastElements": "any",
        "formula": "formula"
    }

    const handleSearch = async () => {
        if (molecularFormula.trim()) {
            setIsLoading(true);
            setError('');
            setSearchResults([]);
            setCurrentPage(1); // 重置到第一页
            
            try {
                const response = await authFetch(`${BASE_URL}/api/sse/search?query=${encodeURIComponent(molecularFormula.replace(/,/g, '-'))}&match_model=${matchModelEnums[activeTab]}`);
                
                if (!response.ok) {
                    throw new Error(`搜索请求失败: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 假设接口返回的数据结构包含 results 字段
                if (data.results && Array.isArray(data.results)) {
                    setSearchResults(data.results);
                } else {
                    // 如果接口直接返回数组
                    setSearchResults(Array.isArray(data) ? data : []);
                }
                
            } catch (err) {
                console.error('搜索出错:', err);
                setError(err instanceof Error ? err.message : '搜索过程中发生未知错误');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        margin: '0 20px 20px 20px',
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

    // 分页相关计算
    const totalPages = Math.ceil(searchResults.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageData = searchResults.slice(startIndex, endIndex);

    // 默认显示的列
    const defaultDisplayColumns = [
        'sse_id',
        'integer_formula',
        'formula_std',
        'chemical_system',
        'abbreviation_std',
        'phase',
        'framework',
        'polymorph',
        'space_group',
        'electrolyte_chemistry',
        'ionic_conductivity_value (S/cm)',
        'conductivity_temperature(°C)',
        'activation_energy_value (eV)',
        'electrochemical_window_value (V)'
    ];

    // 获取要显示的表头列（默认列 + 操作列）
    const getTableHeaders = (): string[] => {
        if (searchResults.length === 0) return [];
        
        // 获取第一条数据的所有键
        const firstResult = searchResults[0];
        const allKeys = Object.keys(firstResult);
        
        // 筛选出存在的默认列
        const availableDefaultColumns = defaultDisplayColumns.filter(col => allKeys.includes(col));
        
        // 返回默认列 + 操作列
        return [...availableDefaultColumns, 'actions'];
    };

    // 获取所有可用的列（用于详情弹窗）
    const getAllAvailableColumns = (): string[] => {
        if (searchResults.length === 0) return [];
        return Object.keys(searchResults[0]);
    };

    // 分页处理函数
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 滚动到表格顶部
        const container = document.querySelector('.third-search-container-new');
        if (container) {
            window.scrollTo({
                top: (container as HTMLElement).offsetTop,
                behavior: 'smooth'
            });
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
        padding: '20px',
        color: '#666',
        fontStyle: 'italic'
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

    // 操作按钮样式
    const actionButtonStyle: React.CSSProperties = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '500'
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
        maxWidth: '900px',
        maxHeight: '85vh',
        width: '90%',
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
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#e9ecef',
            color: '#495057'
        }
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
        gridTemplateColumns: '200px 1fr',
        gap: '16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#f8f9fa',
            borderColor: '#dee2e6'
        }
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
                <div style={headerBannerStyle}>
                    Search for materials information by chemistry, composition, or property.
                </div>

                {/* 搜索栏 */}
                <div style={searchBarStyle}>
                    <button style={materialsButtonStyle}>Materials</button>
                    
                    {/* 自定义输入框，替代库的输入框 */}
                    <input
                        style={customInputStyle}
                        value={molecularFormula}
                        onChange={handleInputChange}
                        placeholder=""
                    />
                    
                    <button style={iconButtonStyle} title="Periodic Table" onClick={() => setInputShow(!inputShow)}>
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
                        {isLoading ? '搜索中...' : 'Search'}
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
                                        style={activeTab === 'elements' ? activeTabStyle : tabStyle}
                                        onClick={() => {
                                            setActiveTab('elements');
                                            triggerLiClick(0);
                                        }}
                                    >
                                        Only Elements
                                    </button>
                                    <button 
                                        style={activeTab === 'atLeastElements' ? activeTabStyle : tabStyle}
                                        onClick={() => {
                                            setActiveTab('atLeastElements');
                                            triggerLiClick(1);
                                        }}
                                    >
                                        At Least Elements
                                    </button>
                                    <button 
                                        style={activeTab === 'formula' ? activeTabStyle : tabStyle}
                                        onClick={() => {
                                            setActiveTab('formula');
                                            triggerLiClick(2);
                                        }}
                                    >
                                        Formula
                                    </button>
                                </div>

                                {/* MaterialsInput组件 - 通过CSS隐藏输入框，只显示周期表 */}
                                <div ref={ref} style={materialsInputContainerStyle} className="materials-input-container">
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
                            </>
                        )
                    }   

                    {/* 搜索结果展示区域 */}
                    <div style={resultsContainerStyle}>
                        {/* 加载状态 */}
                        {isLoading && (
                            <div style={loadingStyle}>
                                <div>正在搜索中，请稍候...</div>
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
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPageData.map((result, index) => (
                                            <tr key={startIndex + index}>
                                                {getTableHeaders().map((header) => {
                                                    if (header === 'actions') {
                                                        return (
                                                            <td key={header} style={tdStyle}>
                                                                <button 
                                                                    style={actionButtonStyle}
                                                                    onClick={() => {
                                                                        setSelectedRecord(result);
                                                                        setShowDetailModal(true);
                                                                    }}
                                                                >
                                                                    查看详情
                                                                </button>
                                                            </td>
                                                        );
                                                    }
                                                    return (
                                                        <td key={header} style={tdStyle}>
                                                            {typeof result[header] === 'object' && result[header] !== null
                                                                ? JSON.stringify(result[header])
                                                                : String(result[header] || '-')
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
                                    上一页
                                </button>

                                {/* 页码信息 */}
                                <div style={pageInfoStyle}>
                                    第 {currentPage} 页，共 {totalPages} 页
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
                                    下一页
                                </button>
                            </div>
                        )}

                        {/* 无搜索结果 */}
                        {!isLoading && !error && searchResults.length === 0 && searchResults.length !== 0 && (
                            <div style={noResultsStyle}>
                                未找到相关结果
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
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                材料详细信息
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
                                        <div style={detailLabelStyle}>{key}</div>
                                        <div style={detailValueStyle}>
                                            {typeof selectedRecord[key] === 'object' && selectedRecord[key] !== null
                                                ? JSON.stringify(selectedRecord[key], null, 2)
                                                : String(selectedRecord[key] || '-')
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
