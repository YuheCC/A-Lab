import React, { useState } from 'react';
import { MaterialsInput } from '@materialsproject/mp-react-components';

const ThirdSearch: React.FC = () => {
    const [molecularFormula, setMolecularFormula] = useState<string>('CoNi');
    const [activeTab, setActiveTab] = useState<'elements' | 'atLeastElements' | 'formula'>('formula');

    const handleFormulaChange = (value: string) => {
        setMolecularFormula(value);
    };

    const handleSearch = () => {
        if (molecularFormula.trim()) {
            console.log('搜索化学分子式:', molecularFormula);
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
        borderBottom: '1px solid #ddd'
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
        fontWeight: '500'
    };

    // 主要内容区域
    const mainContentStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '20px',
        margin: '0 20px 20px 20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
        marginTop: '20px'
    };

    return (
        <>
            <div style={containerStyle}>
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
                        placeholder="CoNi"
                    />
                    
                    <button style={iconButtonStyle} title="Help">
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>?</span>
                    </button>
                    
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
                    
                    <button style={searchButtonStyle} onClick={handleSearch}>
                        Search
                    </button>
                </div>

                {/* 主要内容 */}
                <div style={mainContentStyle}>
                    {/* 标签页 */}
                    <div style={tabContainerStyle}>
                        <button 
                            style={activeTab === 'elements' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('elements')}
                        >
                            Only Elements
                        </button>
                        <button 
                            style={activeTab === 'atLeastElements' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('atLeastElements')}
                        >
                            At Least Elements
                        </button>
                        <button 
                            style={activeTab === 'formula' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('formula')}
                        >
                            Formula
                        </button>
                    </div>

                    {/* MaterialsInput组件 - 通过CSS隐藏输入框，只显示周期表 */}
                    <div style={materialsInputContainerStyle} className="materials-input-container">
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
            </div>
        </>
    );
};

export default ThirdSearch;
