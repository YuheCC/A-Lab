import React, { useRef, useState } from 'react';
import { MaterialsInput } from '@materialsproject/mp-react-components';
import './third.css';
import { authFetch } from '@/utils';

// 定义搜索结果的数据类型
interface SearchResult {
    [key: string]: any;
}

const ThirdSearch: React.FC = () => {
    const [molecularFormula, setMolecularFormula] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'elements' | 'atLeastElements' | 'formula'>('formula');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const ref = useRef<HTMLDivElement>(null);
    const [inputShow, setInputShow] = useState<boolean>(false);

    const handleFormulaChange = (value: string) => {
        setMolecularFormula(value);
    };

    const handleSearch = async () => {
        if (molecularFormula.trim()) {
            setIsLoading(true);
            setError('');
            setSearchResults([]);
            setCurrentPage(1); // 重置到第一页
            
            try {
                const response = await authFetch(`${BASE_URL}/api/sse/search?query=${encodeURIComponent(molecularFormula)}`);
                
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

    // 动态获取表头列
    const getTableHeaders = (): string[] => {
        if (searchResults.length === 0) return [];
        
        // 获取第一条数据的所有键作为表头
        const firstResult = searchResults[0];
        return Object.keys(firstResult);
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
                    
                    <button style={iconButtonStyle} title="Periodic Table">
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
                                                {getTableHeaders().map((header) => (
                                                    <td key={header} style={tdStyle}>
                                                        {typeof result[header] === 'object' && result[header] !== null
                                                            ? JSON.stringify(result[header])
                                                            : String(result[header] || '-')
                                                        }
                                                    </td>
                                                ))}
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
        </>
    );
};

export default ThirdSearch;
