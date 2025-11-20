import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const Introduction: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="design-introduction-container">
      <p className="introduction-placeholder">
        {t('design.introduction.comingSoon', 'Introduction content coming soon...')}
      </p>
    </div>
  );
};

export default Introduction;
