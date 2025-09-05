import { useState, useEffect } from "react";
import "./Predict.css";

const Predict = () => {
    const [activeTab, setActiveTab] = useState<'performance' | 'early-life'>('performance');

    useEffect(() => {
        // Check for tab query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam === 'early-life' || tabParam === 'performance') {
            setActiveTab(tabParam);
        }
    }, []);

    return (
        <div className="predict-container">
            {/* Tab Navigation */}
            <div className="predict-tabs-container">
                <div className="predict-tabs-wrapper">
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`predict-tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                    >
                        Cell performance prediction with additive molecules
                    </button>
                    <button
                        onClick={() => setActiveTab('early-life')}
                        className={`predict-tab-button ${activeTab === 'early-life' ? 'active' : ''}`}
                    >
                        电池早期生命预测工具
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="predict-tab-content">
                {activeTab === 'performance' && (
                    <div className="performance-prediction">
                        <h2>Cell performance prediction with additive molecules</h2>
                        <p>Beta version - Coming soon</p>
                    </div>
                )}
                {activeTab === 'early-life' && (
                    <div className="early-life-prediction">
                        <h2>电池早期生命预测工具</h2>
                        <p>Beta version - 即将推出</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predict;