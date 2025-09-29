import React, { useState } from 'react';
import ResultTip from './index';

const ResultTipExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmitConfig = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>ResultTip 组件示例</h3>

      <button
        onClick={handleSubmitConfig}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          cursor: 'pointer'
        }}
      >
        提交配置（显示ResultTip）
      </button>

      <ResultTip
        isVisible={isVisible}
        onClose={handleClose}
      />
    </div>
  );
};

export default ResultTipExample;