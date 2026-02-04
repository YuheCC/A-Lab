import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from '@umijs/max';
import { useTranslation, Trans } from 'react-i18next';
import CollapsibleText from '@/components/CollapsibleText';
import FeatureCard from '@/pages/Design/components/FeatureCard';
import FeatureCardGroup from '@/pages/Design/components/FeatureCardGroup';
import TabSection from '@/components/TabSection';
import { useAuthStore } from '@/models/useAuth';
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
  const { hasPermissionNew } = useAuthStore();

  // 检查是否有 train 权限
  const canTrain = hasPermissionNew('cell_life:train');

  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = (): string => {
    // Check if navigation state has activeTab (from train page)
    const stateTab = (location.state as any)?.activeTab;
    // 如果没有 train 权限且试图访问 models tab，则重定向到 introduction
    if (stateTab === 'models' && !canTrain) return 'introduction';
    if (stateTab === 'models') return 'models';

    const tabParam = searchParams.get('tab');
    // 如果没有 train 权限且试图访问 models tab，则重定向到 introduction
    if (tabParam === 'models' && !canTrain) return 'introduction';
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // 根据权限动态生成 tabs，没有 train 权限时不显示 models tab
  const tabs = [
    { key: 'introduction', label: t('predictionTool.tabs.introduction', 'Introduction'), disabled: false },
    { key: 'records', label: t('predictionTool.tabs.records', 'Records'), disabled: false },
    ...(canTrain ? [{ key: 'models', label: t('predictionTool.tabs.models', 'Models'), disabled: false }] : [])
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

  // 当权限变化时，如果当前在 models tab 但没有权限，则切换到 introduction
  useEffect(() => {
    if (activeTab === 'models' && !canTrain) {
      setActiveTab('introduction');
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', 'introduction');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [canTrain, activeTab]);

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
          onClick={canTrain ? handleTrain : undefined}
          disabled={!canTrain}
          disabledTip={!canTrain ? (
            <Trans
              i18nKey="predictionTool.trainDisabledTip"
              components={{
                emailLink: <a href="mailto:mu.sales@ses.ai" />
              }}
            />
          ) : undefined}
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
