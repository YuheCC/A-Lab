import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import CollapsibleText from '@/components/CollapsibleText';
import FeatureCard from '../components/FeatureCard';
import FeatureCardGroup from '../components/FeatureCardGroup';
import TabSection from '@/components/TabSection';
import IntroductionContent from './components/IntroductionContent';
import RecordsContent from './components/RecordsContent';
import './index.less';

// 本地图标路径
const ICONS = {
  resultPrediction: "/design/electrode/icon-result-prediction.svg",
  trendAnalysis: "/design/electrode/icon-trend-analysis.svg",
  optimize: "/design/electrode/icon-optimize.svg",
  train: "/design/electrode/icon-train.svg"
};

const ElectrodePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('introduction');

  const tabs = [
    { key: 'introduction', label: t('design.electrode.tabs.introduction'), disabled: false },
    { key: 'records', label: t('design.electrode.tabs.records'), disabled: false },
    // { key: 'models', label: t('design.electrode.tabs.models'), disabled: true }
  ];

  const handleNavigateToPredict = () => {
    navigate('/design/electrode/predict');
  };

  const handleNavigateToOptimize = () => {
    navigate('/design/electrode/optimize');
  };

  return (
    <div id="electrode-page">
      <div className="electrode-page__header">
        <h1 className="electrode-page__title">
          {t('design.electrode.title')}
        </h1>
        <CollapsibleText className="electrode-page__subtitle">
          {t('design.electrode.subtitle')}
        </CollapsibleText>
      </div>

      <FeatureCardGroup 
        columns={{
          default: 1,
          sm: 2,
          lg: 4,
        }}
        gap={16}
      >
        <FeatureCard
          icon={<img src={ICONS.resultPrediction} alt="" style={{ width: 20, height: 20 }} />}
          title={t('design.electrode.features.resultPrediction.title')}
          description={t('design.electrode.features.resultPrediction.description')}
          iconBgColor="#dbeafe"
          onClick={handleNavigateToPredict}
        />
        {/* <FeatureCard
          icon={<img src={ICONS.trendAnalysis} alt="" style={{ width: 20, height: 20 }} />}
          title={t('design.electrode.features.trendAnalysis.title')}
          description={t('design.electrode.features.trendAnalysis.description')}
          iconBgColor="#f3e8ff"
        /> */}
        <FeatureCard
          icon={<img src={ICONS.optimize} alt="" style={{ width: 20, height: 20 }} />}
          title={t('design.electrode.features.optimize.title')}
          description={t('design.electrode.features.optimize.description')}
          iconBgColor="#dcfce7"
          onClick={handleNavigateToOptimize}
        />
        <FeatureCard
          icon={<img src={ICONS.train} alt="" style={{ width: 20, height: 20 }} />}
          title={t('design.electrode.features.train.title')}
          description={t('design.electrode.features.train.description')}
          iconBgColor="#fef3c6"
          disabled={true}
        />
      </FeatureCardGroup>

      <TabSection activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
        {activeTab === 'introduction' && <IntroductionContent />}
        {activeTab === 'records' && <RecordsContent />}
      </TabSection>
    </div>
  );
};

export default ElectrodePage;
