import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Spin, message } from 'antd';
import * as electrodeModel from '../model';
import {
  isOptimizeHistoryItem,
} from '../model';
import type {
  ElectrodeHistoryItem,
  UniversalHistoryDetailResponse,
  } from '../model';
import PredictDetail from './PredictDetail';
import OptimizeDetailContent from './OptimizeDetail';
import './index.less';

const DetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // 从 URL 参数获取 type 用于 API 请求，默认为 1（正向预测）
  const typeParam = searchParams.get('type');
  const requestType = typeParam === '2'
    ? electrodeModel.PageType.INVERSE_DESIGN
    : electrodeModel.PageType.RESULT_PREDICTION;

  // 状态管理 - 使用联合类型存储返回数据
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<UniversalHistoryDetailResponse | null>(null);

  // 加载详情数据
  useEffect(() => {
    const loadDetailData = async () => {
      if (!id) {
        message.error('无效的记录 ID');
        navigate(-1);
        return;
      }

      setLoading(true);
      try {
        const response = await electrodeModel.getElectrodeHistoryDetail({
          id: parseInt(id, 10),
          type: requestType,
        });

        // 直接存储返回数据，后续根据返回数据的 type 字段判断样式
        setDetailData(response);
      } catch (error) {
        message.error('加载详情失败');
        console.error('[DetailPage] Load detail error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, requestType]);

  // 根据 Cell Design 获取 NP Ratio
  const getNpRatio = (cellDesign: string): string => {
    switch (cellDesign) {
      case 'Balanced':
        return '1.07';
      case 'High Energy':
        return '1.05';
      case 'High Power':
        return '1.10';
      default:
        return '1.07';
    }
  };

  const handleGoBack = () => {
    // 根据 type 参数决定返回到哪个 subTab
    // type=2: inverse-design, type=1 或未指定: result-prediction
    const subTab = typeParam === '2' ? 'inverse-design' : 'result-prediction';
    navigate(`/design/electrode?tab=records&subTab=${subTab}`);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="electrode-predict-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('common.loading', '加载中...')} />
      </div>
    );
  }

  // 根据返回数据的 type 字段判断样式（使用类型守卫）
  // type=2: Optimize 样式（参考 Optimize 页面，所有输入 disabled，无计算按钮）
  if (detailData && isOptimizeHistoryItem(detailData)) {
    const { cell_design, np_ratio, cathode_active_material, anode_active_material, model_params, model_result } = detailData;
    const npRatio = np_ratio || getNpRatio(cell_design);

    // 渲染 Optimize Detail 组件
    return (
      <OptimizeDetailContent
        t={t}
        historyId={detailData.id}
        cellDesign={cell_design}
        npRatio={npRatio}
        cathodeActiveMaterial={cathode_active_material}
        anodeActiveMaterial={anode_active_material}
        modelParams={model_params}
        modelResult={model_result}
        onGoBack={handleGoBack}
      />
    );
  }

  // type=1: Predict 样式（保持原有样式）
  // 如果没有数据，显示空状态
  if (!detailData) {
    return (
      <div className="electrode-predict-container">
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {t('common.noData', '未找到记录')}
          </div>
        </div>
      </div>
    );
  }

  // type=1: 此时 detailData 是 ElectrodeHistoryItem 类型
  const predictData = detailData as ElectrodeHistoryItem;
  const { cell_design, model_params } = predictData;
  // 优先使用 model_params 中的 npRatio，如果没有则根据 cell_design 计算（向后兼容）
  const npRatio = model_params.npRatio !== undefined ? String(model_params.npRatio) : getNpRatio(cell_design);

  return (
    <PredictDetail
      t={t}
      predictData={predictData}
      npRatio={npRatio}
      onGoBack={handleGoBack}
    />
  );
};

export default DetailPage;
