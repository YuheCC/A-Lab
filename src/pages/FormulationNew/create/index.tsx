import React from 'react';
import { useNavigate } from '@umijs/max';
import FormulationModule from '@/pages/Formulation/components/FormulationModule';
import './index.css';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate('/formulation');
  };

  return (
    <div className="create-page-container">
      <div className="create-header">
        <h1 className="create-title">Salt & Solvent Configuration</h1>
        <span className="create-subtitle">Configure and customize your electrolytes</span>
        <div className="create-actions">
          <span className="create-action-title">New Configuration</span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            Back to List
          </button>
        </div>
      </div>

      <div className="create-content formulation-container">
        <FormulationModule />
      </div>
    </div>
  );
};

export default CreatePage;