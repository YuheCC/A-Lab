import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import CollapsibleText from '@/components/CollapsibleText';
import FeatureCard from '@/pages/Design/components/FeatureCard';
import FeatureCardGroup from '@/pages/Design/components/FeatureCardGroup';
import TabSection from '@/components/TabSection';
import Introduction from './components/Introduction';
import RecordsContent from './components/RecordsContent';
import ModelsContent from './components/ModelsContent';
import './index.less';

// 本地图标路径
const ICONS = {
  newPrediction: "/design/electrode/icon-result-prediction.svg",
  train: "/design/electrode/icon-train.svg"
};

const PredictionTool: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): string => {
    // Check if navigation state has activeTab (from train page)
    const stateTab = (location.state as any)?.activeTab;
    if (stateTab === 'models') return 'models';

    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  const tabs = [
    { key: 'introduction', label: t('predictionTool.tabs.introduction', 'Introduction'), disabled: false },
    { key: 'records', label: t('predictionTool.tabs.records', 'Records'), disabled: false },
    { key: 'models', label: t('predictionTool.tabs.models', 'Models'), disabled: false }
  ];

  // 初始化时,如果URL没有tab参数且没有从state传递,则设置默认值
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const stateTab = (location.state as any)?.activeTab;
    if (!tabParam && !stateTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
      setSearchParams(newSearchParams, { replace: true });
    } else if (stateTab && !tabParam) {
      // 如果是从state传递的tab,同步到URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

  const handleNewPrediction = () => {
    navigate('/predict/create');
  };

  const handleTrain = () => {
    navigate('/predict/train');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // 更新URL参数
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams, { replace: true });
  };

  return (
    <div id="prediction-tool-page">
      <div className="prediction-tool-page__header">
        <h1 className="prediction-tool-page__title">
          {t('predictionTool.title')}
        </h1>
        <CollapsibleText className="prediction-tool-page__subtitle">
          {t('predictionTool.subtitle')}
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
          icon={<img src={ICONS.newPrediction} alt="" style={{ width: 20, height: 20 }} />}
          title={t('predictionTool.features.newPrediction.title', 'New Prediction')}
          description={t('predictionTool.features.newPrediction.description', 'Create a new battery cycle life prediction based on early cycle data')}
          iconBgColor="#dbeafe"
          onClick={handleNewPrediction}
        />
        <FeatureCard
          icon={<img src={ICONS.train} alt="" style={{ width: 20, height: 20 }} />}
          title={t('predictionTool.features.train.title', 'Train Model')}
          description={t('predictionTool.features.train.description', 'Train a custom prediction model using your own battery data')}
          iconBgColor="#fef3c6"
          onClick={handleTrain}
        />
      </FeatureCardGroup>

      <TabSection activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs}>
        {activeTab === 'introduction' && <Introduction />}
        {activeTab === 'records' && <RecordsContent />}
        {activeTab === 'models' && <ModelsContent />}
      </TabSection>
    </div>
  );
};

export default PredictionTool;
