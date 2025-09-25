import React, { useState, useEffect } from 'react';
import { Upload, Activity, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StepContent from './components/StepContent';
import UniversalHistoryModule from '../components/UniversalHistoryModule';
import { renderPredictionCard } from './components/PredictionCardRenderer';
import HistoryModal from './components/HistoryModal';
import { getHistoryList, deleteHistory, type PredictResponse } from '@/services/prediction/predictionTool';
import './PredictionTool.css';
import { normalizeServerDate } from '@/utils/messageUtils';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;  // 保留兼容性
  avgCycleLife1: number;
  avgCycleLife2: number;
}

// Mock数据已移除，使用真实API数据

const PredictionTool: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 将API数据转换为FileRecord格式
  const transformApiDataToFileRecord = (apiData: PredictResponse): FileRecord => {
    const avgCycleLife1 = apiData.avg_cycle_life_1 || 0;
    const avgCycleLife2 = apiData.avg_cycle_life_2 || 0;
    const avgCycleLife = avgCycleLife1 > 0 ? avgCycleLife1 : avgCycleLife2;

    return {
      id: apiData.id.toString(),
      name: apiData.file_name,
      date: new Date(normalizeServerDate(apiData.created_at)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      batteryCount: apiData.barcode_count,
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(1)}${t('predictionTool.results.cycleUnit')}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2
    };
  };

  // 加载历史记录
  const loadHistoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHistoryList({ page: 1, page_size: 20 });
      const transformedData = response.data.map(transformApiDataToFileRecord);
      setHistoryData(transformedData);
    } catch (err: any) {
      setError(err.message || t('predictionTool.errors.loadHistoryFailed'));
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取历史记录
  useEffect(() => {
    loadHistoryData();
  }, []);

  const steps = [
    {
      id: 'upload',
      title: t('predictionTool.steps.upload'),
      icon: Upload
    },
    {
      id: 'ai-predict',
      title: t('predictionTool.steps.aiPredict'),
      icon: Activity
    },
    {
      id: 'results',
      title: t('predictionTool.steps.results'),
      icon: BarChart3
    }
  ];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const handleNewPrediction = () => {
    setCurrentStep(0);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedFile(null);
    setError(null);
  };

  const handleViewDetails = (file: FileRecord) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleDeleteFile = async (fileId: string) => {
    // 显示确认对话框
    if (!confirm(t('predictionTool.history.deleteConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      await deleteHistory({ id: parseInt(fileId) });
      
      // 删除成功后，重新加载历史记录
      await loadHistoryData();
    } catch (err: any) {
      setError(err.message || t('predictionTool.history.deleteFailed'));
      console.error('Delete file error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  return (
    <div className="prediction-tool">
      <div className="prediction-layout">
        <div className="left-area">
          {error && (
            <div style={{
              color: '#e53e3e',
              backgroundColor: '#fed7d7',
              padding: '12px',
              borderRadius: '6px',
              margin: '16px 0',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          <UniversalHistoryModule
            title={t('predictionTool.history.title')}
            data={historyData}
            cardRenderer={renderPredictionCard}
            onNewPrediction={handleNewPrediction}
            onViewDetails={handleViewDetails}
            onDeleteItem={handleDeleteFile}
            newPredictionText={t('predictionTool.history.newPrediction')}
            filterConfig={{
              smilesSearchPlaceholder: t('predictionTool.history.searchPlaceholder')
            }}
          />
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px',
              color: '#666'
            }}>
              {t('predictionTool.history.loading')}
            </div>
          )}
        </div>

        <div className="right-area">
          <div className="prediction-header">
            <div className="title-row">
              <h1 className="prediction-title">{t('predictionTool.title')}</h1>
              <span className="beta-tag">{t('predictionTool.betaTag')}</span>
            </div>
            <p className="prediction-subtitle">{t('predictionTool.subtitle')}</p>
          </div>

          <div className="operation-area">
            <div className="steps-container">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(index);

                return (
                  <div
                    key={step.id}
                    className="step-item"
                    // onClick={() => setCurrentStep(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`step-icon ${status}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`step-text ${status}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <StepContent
              activeStep={currentStep}
              onStepChange={setCurrentStep}
              onPredictionComplete={loadHistoryData}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>

      <HistoryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        fileRecord={selectedFile}
      />
    </div>
  );
};

export default PredictionTool;