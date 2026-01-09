import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';
import type { ModuleType } from '../ModuleNav';
import StepIndicator from '../StepIndicator';
import Consistency from '../Consistency';
import Detection from '../Detection';
import KValue from '../KValue';
import Sorting from '../Sorting';
import Ultrasound from '../Ultrasound';
import './index.less';

interface ModuleContentProps {
  activeModule: ModuleType;
}

type StepType = 'intro' | 'upload' | 'processing' | 'result';

const ModuleContent: React.FC<ModuleContentProps> = ({ activeModule }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [progress, setProgress] = useState(0);

  // 模块配置
  const moduleConfigs = {
    consistency: {
      layout: 'small-column',
      images: [
        {
          src: '/manufacturing/1-3.png',
          title: t('manufacturing.modules.consistency.imageTitle'),
        },
      ],
    },
    detection: {
      layout: 'small-column',
      images: [
        {
          src: '/manufacturing/3-1.png',
          title: t('manufacturing.modules.detection.imageTitle'),
        },
      ],
    },
    kvalue: {
      layout: 'no-column',
      images: [
        {
          src: '/manufacturing/2-1.png',
          title: t('manufacturing.modules.kvalue.imageTitle1'),
        },
        {
          src: '/manufacturing/2-2.png',
          title: t('manufacturing.modules.kvalue.imageTitle2'),
        },
      ],
    },
    sorting: {
      layout: 'small-column',
      images: [
        {
          src: '/manufacturing/4-1.png',
          title: t('manufacturing.modules.sorting.imageTitle'),
        },
      ],
    },
    ultrasound: {
      layout: 'small-column',
      images: [
        {
          src: '/manufacturing/3-3.png',
          title: t('manufacturing.modules.ultrasound.imageTitle'),
        },
      ],
    },
  };

  // 获取段落内容
  const getParagraphs = (module: ModuleType): string[] => {
    const paragraphs: string[] = [];
    let index = 1;
    while (true) {
      const key = `manufacturing.modules.${module}.paragraph${index}`;
      const text = t(key);
      if (text === key) break; // 如果翻译键不存在，停止
      paragraphs.push(text);
      index++;
    }
    return paragraphs;
  };

  // 检查是否有数据信息
  const hasDataInfo = (module: ModuleType): boolean => {
    const key = `manufacturing.modules.${module}.dataSize`;
    return t(key) !== key;
  };

  const config = moduleConfigs[activeModule];
  const isGridLayout = config.images.length > 1;

  // 切换模块时重置到介绍页面
  useEffect(() => {
    setCurrentStep('intro');
    setProgress(0);
  }, [activeModule]);

  // 开始演示
  const handleStartDemo = () => {
    setCurrentStep('upload');
  };

  // 使用演示数据（跳转到处理步骤）
  const handleUseDemoData = () => {
    setCurrentStep('processing');
    simulateProcessing();
  };

  // 模拟处理过程
  const simulateProcessing = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentStep('result');
        }, 500);
      }
    }, 150);
  };

  // 返回介绍页面
  const handleBackToIntro = () => {
    setCurrentStep('intro');
    setProgress(0);
  };

  // 获取当前步骤编号（用于步骤指示器）
  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'intro':
        return 0;
      case 'upload':
        return 1;
      case 'processing':
        return 2;
      case 'result':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="module-content-container">
      {/* 标题 */}
      <div className="panel-header">
        <h3 className="panel-title">{t(`manufacturing.modules.${activeModule}.title`)}</h3>
      </div>

      {/* 步骤指示器（除了介绍页面外都显示） */}
      {currentStep !== 'intro' && <StepIndicator currentStep={getStepNumber()} />}

      {/* 步骤 1: 介绍页面 */}
      {currentStep === 'intro' && (
        <div className="step-content intro-step active">
          <div className={`intro-layout ${config.layout}`}>
            {/* 文字内容区域 */}
            <div className="intro-text">
              {/* 段落内容 */}
              {getParagraphs(activeModule).length > 0 ? (
                <>
                  {getParagraphs(activeModule).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </>
              ) : (
                <>
                  <p>{t(`manufacturing.modules.${activeModule}.description`)}</p>
                  {t(`manufacturing.modules.${activeModule}.description2`) !== `manufacturing.modules.${activeModule}.description2` && (
                    <p>{t(`manufacturing.modules.${activeModule}.description2`)}</p>
                  )}
                </>
              )}
            </div>

            {/* 图片展示区域 */}
            {isGridLayout ? (
              <div className="intro-images-grid">
                {config.images.map((image, index) => (
                  <div key={index} className="intro-image-item">
                    <h4>{image.title}</h4>
                    <img src={image.src} alt={image.title} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="intro-image">
                <h4>{config.images[0].title}</h4>
                <img src={config.images[0].src} alt={config.images[0].title} />
              </div>
            )}
          </div>

          {/* 数据信息卡片 */}
          {hasDataInfo(activeModule) && (
            <div className="data-info-cards">
              <div className="data-info-card">
                <div className="data-info-label">{t('manufacturing.dataLabels.dataSize')}</div>
                <div className="data-info-value">{t(`manufacturing.modules.${activeModule}.dataSize`)}</div>
              </div>
              <div className="data-info-card">
                <div className="data-info-label">{t('manufacturing.dataLabels.dataType')}</div>
                <div className="data-info-value">{t(`manufacturing.modules.${activeModule}.dataType`)}</div>
              </div>
              <div className="data-info-card wide">
                <div className="data-info-label">{t('manufacturing.dataLabels.dataSource')}</div>
                <div className="data-info-value">{t(`manufacturing.modules.${activeModule}.dataSource`)}</div>
              </div>
              <div className="data-info-card wide">
                <div className="data-info-label">{t(`manufacturing.modules.${activeModule}.targetLabel`)}</div>
                <div className="data-info-value">{t(`manufacturing.modules.${activeModule}.target`)}</div>
              </div>
            </div>
          )}

          <div className="intro-actions">
            <Button
              variant="primary"
              size="mlarge"
              onClick={handleStartDemo}
              rightIcon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              }
            >
              {t('manufacturing.buttons.startDemo')}
            </Button>
            <button className="btn-secondary contact-sales-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h12c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1z"/>
                <path d="M15 4L8 9 1 4"/>
              </svg>
              {t('manufacturing.buttons.contactSales')}
            </button>
          </div>
        </div>
      )}

      {/* 步骤 2: 上传步骤 */}
      {currentStep === 'upload' && (
        <div className="step-content upload-step active">
          <div className="upload-area">
            <div className="upload-card">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 10C17.373 10 12 12.686 12 16v4c0 3.314 5.373 6 12 6s12-2.686 12-6v-4c0-3.314-5.373-6-12-6z" fill="currentColor" opacity="0.2"/>
                  <ellipse cx="24" cy="16" rx="12" ry="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 20v8c0 3.314 5.373 6 12 6s12-2.686 12-6v-8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 28v4c0 3.314 5.373 6 12 6s12-2.686 12-6v-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="upload-title">{t('manufacturing.upload.title')}</h3>
              <p className="upload-desc">{t('manufacturing.upload.description')}</p>
              <div className="upload-buttons">
                <Button
                  variant="primary"
                  size="mlarge"
                  onClick={handleUseDemoData}
                  rightIcon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 4l4 4-4 4"/>
                    </svg>
                  }
                >
                  {t('manufacturing.upload.useDemoData')}
                </Button>
              </div>
              {/* <button className="btn-link">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2v12M2 8h12"/>
                </svg>
                {t('manufacturing.upload.downloadDemo')}
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* 步骤 3: 处理步骤 */}
      {currentStep === 'processing' && (
        <div className="step-content processing-step active">
          <div className="processing-content">
            <div className="processing-header">
              <div className="loading-spinner"></div>
              <h3 className="processing-title">{t('manufacturing.processing.title')}</h3>
            </div>

            <div className="progress-section">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-percentage">{Math.floor(progress)}%</div>
            </div>

            <div className="processing-steps">
              <div className={`process-item ${progress > 30 ? 'completed' : progress > 0 ? 'active' : ''}`}>
                <div className="process-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 10l4 4 8-8"/>
                  </svg>
                </div>
                <span className="process-label">{t('manufacturing.processing.step1')}</span>
                <div className="process-status">{progress > 30 ? '✓' : '○'}</div>
              </div>
              <div className={`process-item ${progress > 60 ? 'completed' : progress > 30 ? 'active' : ''}`}>
                <div className="process-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="8"/>
                  </svg>
                </div>
                <span className="process-label">{t('manufacturing.processing.step2')}</span>
                <div className="process-status">{progress > 60 ? '✓' : progress > 30 ? '⟳' : '○'}</div>
              </div>
              <div className={`process-item ${progress >= 100 ? 'completed' : progress > 60 ? 'active' : ''}`}>
                <div className="process-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="4" y="4" width="12" height="12"/>
                  </svg>
                </div>
                <span className="process-label">{t('manufacturing.processing.step3')}</span>
                <div className="process-status">{progress >= 100 ? '✓' : '○'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 4: 结果步骤 */}
      {currentStep === 'result' && (
        <div className="step-content result-step active">
          <div className="result-content">
            {/* 根据不同模块渲染不同的结果组件 */}
            {activeModule === 'consistency' ? (
              <Consistency onBackToIntro={handleBackToIntro} />
            ) : activeModule === 'detection' ? (
              <Detection onBackToIntro={handleBackToIntro} />
            ) : activeModule === 'kvalue' ? (
              <KValue onBackToIntro={handleBackToIntro} />
            ) : activeModule === 'sorting' ? (
              <Sorting onBackToIntro={handleBackToIntro} />
            ) : activeModule === 'ultrasound' ? (
              <Ultrasound onBackToIntro={handleBackToIntro} />
            ) : (
              <>
                {/* 完成提示 */}
                <div className="result-header">
                  <div className="success-icon">✓</div>
                  <h3 className="result-title">{t('manufacturing.result.complete')}</h3>
                  <p className="result-desc">
                    {t('manufacturing.result.fileAnalyzed')} <span className="filename">demo_data.csv</span> {t('manufacturing.result.fileSuccess')}
                  </p>
                </div>

                {/* 统计卡片 */}
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-label">{t('manufacturing.result.stats.score')}</span>
                      <span className="stat-info">ℹ</span>
                    </div>
                    <div className="stat-value">96.8%</div>
                    <div className="stat-desc">{t('manufacturing.result.stats.scoreDesc')}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <span className="stat-label">{t('manufacturing.result.stats.passed')}</span>
                      <span className="stat-info">ℹ</span>
                    </div>
                    <div className="stat-value">847/900</div>
                    <div className="stat-desc">{t('manufacturing.result.stats.passedDesc')}</div>
                  </div>
                  <div className="stat-card warning">
                    <div className="stat-header">
                      <span className="stat-label">{t('manufacturing.result.stats.attention')}</span>
                      <span className="stat-info">ℹ</span>
                    </div>
                    <div className="stat-value">53 {t('manufacturing.result.stats.items')}</div>
                    <div className="stat-desc">{t('manufacturing.result.stats.attentionDesc')}</div>
                  </div>
                </div>

                {/* 图表区域 */}
                <div className="chart-section">
                  <h3 className="chart-title">{t('manufacturing.result.chartTitle')}</h3>
                  <div className="chart-placeholder">
                    <div className="chart-placeholder-text">
                      {t('manufacturing.result.chartPlaceholder', '图表展示区域')}
                    </div>
                  </div>
                </div>

                {/* 分析总结 */}
                <div className="analysis-summary">
                  <h4 className="summary-title">{t('manufacturing.result.summary.title')}</h4>
                  <ul className="summary-list">
                    <li>✓ {t('manufacturing.result.summary.point1')}</li>
                    <li>✓ {t('manufacturing.result.summary.point2')}</li>
                    <li>⚠ {t('manufacturing.result.summary.point3')}</li>
                    <li>✓ {t('manufacturing.result.summary.point4')}</li>
                  </ul>
                </div>

                {/* 操作按钮 */}
                <div className="result-actions">
                  <button className="btn-secondary" onClick={handleBackToIntro}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10 12l-4-4 4-4"/>
                    </svg>
                    {t('manufacturing.result.backToIntro')}
                  </button>
                  <Button
                    variant="primary"
                    size="mlarge"
                    leftIcon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2v10m-4-6l4-4 4 4"/>
                      </svg>
                    }
                  >
                    {t('manufacturing.result.exportReport')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleContent;
