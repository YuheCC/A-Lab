import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Select, Input, Slider } from 'antd';
import ParameterInput from './components/ParameterInput';
import ResultDisplay from './components/ResultDisplay';
import './index.less';

const { Option } = Select;

const PredictPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 表单状态
  const [cellDesign, setCellDesign] = useState('');
  const [anodeActiveMaterial, setAnodeActiveMaterial] = useState('');
  const [cathodeActiveMaterial, setCathodeActiveMaterial] = useState('');

  // 阳极参数
  const [anodeBinder1, setAnodeBinder1] = useState(0.8);
  const [anodeBinder2, setAnodeBinder2] = useState(0.8);
  const [anodeBinder3, setAnodeBinder3] = useState(0.8);
  const [anodeConductiveCarbon, setAnodeConductiveCarbon] = useState(0.8);
  const [anodeCNT, setAnodeCNT] = useState(0.8);
  const [anodePressDensity, setAnodePressDensity] = useState(0.8);

  // 阴极参数
  const [cathodeBinder1, setCathodeBinder1] = useState(0.8);
  const [cathodeCNT, setCathodeCNT] = useState(0.8);
  const [cathodeConductiveCarbon, setCathodeConductiveCarbon] = useState(0.8);
  const [cathodeArealLoading, setCathodeArealLoading] = useState(0.8);
  const [cathodePressDensity, setCathodePressDensity] = useState(0.8);

  // 尺寸参数
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [layers, setLayers] = useState('');

  // 预测结果
  const [results, setResults] = useState({
    designCapacity: 45.2,
    specificED: 285,
    jellyRollThickness: 8.5,
    volumetricED: 680,
  });

  const handleCalculate = () => {
    // TODO: 调用 API 进行计算
    console.log('Calculate prediction');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="electrode-predict-container">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-predict-actions">
        <h1 className="electrode-predict-title">
          {t('design.electrode.predict.title', 'Result Prediction')}
        </h1>
        <button className="electrode-predict-back-btn" onClick={handleGoBack}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.predict.back', '返回')}
        </button>
      </div>

      <div className="electrode-predict-content">
        {/* 操作区域 */}
        <div className="electrode-predict-operation-area">
          {/* Electrode Design 部分 */}
          <div className="electrode-predict-section">
          <h2 className="electrode-predict-section-title">
            {t('design.electrode.predict.electrodeDesign', 'Electrode Design')}
          </h2>

          <div className="electrode-predict-form-container">
            {/* Cell Design */}
            <div className="electrode-predict-form-item electrode-predict-form-item--full">
              <label className="electrode-predict-label">
              {t('design.electrode.predict.cellDesign', 'Cell Design')}
            </label>
            <Select
              value={cellDesign}
              onChange={setCellDesign}
                placeholder={t('design.electrode.predict.selectCellDesign', 'Select cell design')}
                className="electrode-predict-select"
              >
                <Option value="design1">Design 1</Option>
                <Option value="design2">Design 2</Option>
              </Select>
            </div>

            {/* 阳极和阴极区域 */}
            <div className="electrode-predict-electrode-grid">
              {/* 阳极区域 */}
              <div className="electrode-predict-electrode-section">
                <label className="electrode-predict-label">
                {t('design.electrode.predict.anodeActiveMaterial', 'Anode Active Material')}
              </label>
              <Select
                value={anodeActiveMaterial}
                onChange={setAnodeActiveMaterial}
                  placeholder={t('design.electrode.predict.selectMaterial', 'Select material')}
                  className="electrode-predict-select"
                >
                  <Option value="material1">Material 1</Option>
                  <Option value="material2">Material 2</Option>
                </Select>

                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.anodeParameters', 'Anode Parameters')}
                </h3>

                <div className="electrode-predict-parameters-container">
                <ParameterInput
                  label={t('design.electrode.predict.binder1', 'Binder 1 (wt.%)')}
                  value={anodeBinder1}
                  onChange={setAnodeBinder1}
                />
                <ParameterInput
                  label={t('design.electrode.predict.binder2', 'Binder 2 (wt.%)')}
                  value={anodeBinder2}
                  onChange={setAnodeBinder2}
                />
                <ParameterInput
                  label={t('design.electrode.predict.binder3', 'Binder 3 (wt.%)')}
                  value={anodeBinder3}
                  onChange={setAnodeBinder3}
                />
                <ParameterInput
                  label={t('design.electrode.predict.conductiveCarbon', 'Conductive Carbon (wt.%)')}
                  value={anodeConductiveCarbon}
                  onChange={setAnodeConductiveCarbon}
                />
                <ParameterInput
                  label={t('design.electrode.predict.cnt', 'CNT (wt.%)')}
                  value={anodeCNT}
                  onChange={setAnodeCNT}
                />
                <ParameterInput
                  label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                  value={anodePressDensity}
                    onChange={setAnodePressDensity}
                  />
                </div>
              </div>

              {/* 阴极区域 */}
              <div className="electrode-predict-electrode-section">
                <label className="electrode-predict-label">
                {t('design.electrode.predict.cathodeActiveMaterial', 'Cathode Active Material')}
              </label>
              <Select
                value={cathodeActiveMaterial}
                onChange={setCathodeActiveMaterial}
                  placeholder={t('design.electrode.predict.selectMaterial', 'Select material')}
                  className="electrode-predict-select"
                >
                  <Option value="material1">Material 1</Option>
                  <Option value="material2">Material 2</Option>
                </Select>

                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.cathodeParameters', 'Cathode Parameters')}
                </h3>

                <div className="electrode-predict-parameters-container">
                <ParameterInput
                  label={t('design.electrode.predict.binder1', 'Binder 1 (wt.%)')}
                  value={cathodeBinder1}
                  onChange={setCathodeBinder1}
                />
                <ParameterInput
                  label={t('design.electrode.predict.cnt', 'CNT (wt.%)')}
                  value={cathodeCNT}
                  onChange={setCathodeCNT}
                />
                <ParameterInput
                  label={t('design.electrode.predict.conductiveCarbon', 'Conductive Carbon (wt.%)')}
                  value={cathodeConductiveCarbon}
                  onChange={setCathodeConductiveCarbon}
                />
                <ParameterInput
                  label={t('design.electrode.predict.arealLoading', 'Areal Loading (mAh/cm²)')}
                  value={cathodeArealLoading}
                  onChange={setCathodeArealLoading}
                />
                <ParameterInput
                  label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                  value={cathodePressDensity}
                    onChange={setCathodePressDensity}
                  />
                </div>
              </div>
            </div>

            {/* Dimension 区域 */}
            <div className="electrode-predict-dimension-section">
              <h3 className="electrode-predict-subsection-title">
                {t('design.electrode.predict.dimension', 'Dimension')}
              </h3>
              <div className="electrode-predict-dimension-grid">
                <div className="electrode-predict-dimension-item">
                  <label className="electrode-predict-label-small">
                  {t('design.electrode.predict.width', 'Width (mm)')}
                </label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                    placeholder={t('design.electrode.predict.enterWidth', 'Enter width')}
                  />
                </div>
                <div className="electrode-predict-dimension-item">
                  <label className="electrode-predict-label-small">
                  {t('design.electrode.predict.length', 'Length (mm)')}
                </label>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                    placeholder={t('design.electrode.predict.enterLength', 'Enter length')}
                  />
                </div>
                <div className="electrode-predict-dimension-item">
                  <label className="electrode-predict-label-small">
                  {t('design.electrode.predict.layers', 'Layers')}
                </label>
                <Input
                  type="number"
                  value={layers}
                  onChange={(e) => setLayers(e.target.value)}
                    placeholder={t('design.electrode.predict.enterLayers', 'Enter layers')}
                  />
                </div>
              </div>
            </div>

            {/* Calculate 按钮 */}
            <div className="electrode-predict-calculate-btn-wrapper">
              <Button
                type="primary"
                size="large"
                onClick={handleCalculate}
                className="electrode-predict-calculate-btn"
              >
                {t('design.electrode.predict.calculate', 'Calculate')}
              </Button>
            </div>
          </div>
        </div>

        {/* Cell Performance Prediction 部分 */}
        <div className="electrode-predict-section">
          <h2 className="electrode-predict-section-title">
            {t('design.electrode.predict.cellPerformance', 'Cell Performance Prediction')}
          </h2>

          <div className="electrode-predict-results-container">
            <div className="electrode-predict-results-grid">
            <ResultDisplay
              label={t('design.electrode.predict.designCapacity', 'Design Capacity')}
              value={results.designCapacity}
              unit="Ah"
            />
            <ResultDisplay
              label={t('design.electrode.predict.specificED', 'Specific E.D.')}
              value={results.specificED}
              unit="Wh/kg"
            />
            <ResultDisplay
              label={t('design.electrode.predict.jellyRollThickness', 'Jelly Roll Thickness')}
              value={results.jellyRollThickness}
              unit="mm"
            />
            <ResultDisplay
              label={t('design.electrode.predict.volumetricED', 'Volumetric E.D.')}
              value={results.volumetricED}
                unit="Wh/L"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
