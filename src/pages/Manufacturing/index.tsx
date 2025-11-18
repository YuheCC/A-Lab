import React, { useState } from 'react';
import ModuleNav, { ModuleType } from './components/ModuleNav';
import ModuleContent from './components/ModuleContent';
import './index.less';

const Manufacturing: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('consistency');

  const handleModuleChange = (module: ModuleType) => {
    setActiveModule(module);
  };

  return (
    <div className="manufacturing-container">
      <div className="manufacturing-main">
        <ModuleNav activeModule={activeModule} onModuleChange={handleModuleChange} />
        <ModuleContent activeModule={activeModule} />
      </div>
    </div>
  );
};

export default Manufacturing;
