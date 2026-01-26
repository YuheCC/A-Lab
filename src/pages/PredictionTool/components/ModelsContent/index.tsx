import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { X, RefreshCw } from 'lucide-react';
import { getModelList, getBaseModelList, isMockModel, removeModel } from '../../model';
import { formatUTCDateTime } from '@/utils/dateUtils';
import Pagination from '@/components/Pagination';
import type { ModelListItem } from '@/services/model/training';
import './index.less';

const ModelsContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Models state
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsData, setModelsData] = useState<ModelListItem[]>([]);
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsPageSize] = useState(20);
  const [modelsTotal, setModelsTotal] = useState(0);

  // Models filter state
  const [modelSearchKeyword, setModelSearchKeyword] = useState<string>('');
  const [selectedModelStatus, setSelectedModelStatus] = useState<string>('');
  const [selectedBaseModel, setSelectedBaseModel] = useState<string>('');
  const [selectedBaseModelId, setSelectedBaseModelId] = useState<number | undefined>(undefined);
  const [baseModelOptions, setBaseModelOptions] = useState<Array<{ id: number; name: string }>>([]);

  const fetchModelsData = async (page: number = modelsCurrentPage) => {
    setModelsLoading(true);
    setModelsError(null);

    try {
      const params: any = {
        page,
        page_size: modelsPageSize,
      };

      // Add search keyword if provided
      if (modelSearchKeyword) {
        params.keyword = modelSearchKeyword;
      }

      // Add status filter if selected
      if (selectedModelStatus) {
        params.status = selectedModelStatus;
      }

      // Add base_model_id filter if selected
      if (selectedBaseModelId !== undefined) {
        params.base_model_id = selectedBaseModelId;
      }

      const response = await getModelList(params);
      setModelsData(response.data);
      setModelsTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch models list:', err);
      setModelsError(err instanceof Error ? err.message : t('predictionTool.models.loading.error', 'Failed to load models'));
      setModelsData([]);
      setModelsTotal(0);
    } finally {
      setModelsLoading(false);
    }
  };

  // Fetch base model options from API
  useEffect(() => {
    const fetchBaseModelOptions = async () => {
      try {
        const response = await getBaseModelList({ page: 1, page_size: 100 });
        const options = response.data
          .map(model => ({
            id: model.id,
            name: model.model_name
          }))
          .filter(option => option.name);
        setBaseModelOptions(options);
      } catch (err) {
        console.error('Failed to fetch base model options:', err);
        setBaseModelOptions([]);
      }
    };
    fetchBaseModelOptions();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (modelsCurrentPage === 1) {
      fetchModelsData(1);
    } else {
      setModelsCurrentPage(1);
    }
  }, [modelSearchKeyword, selectedModelStatus, selectedBaseModelId]);

  useEffect(() => {
    fetchModelsData(modelsCurrentPage);
  }, [modelsCurrentPage]);

  const handleDeleteModel = async (id: string) => {
    const model = modelsData.find(m => m.id.toString() === id);
    if (model && isMockModel(model)) {
      alert(t('predictionTool.models.cannotDeleteDemo', 'Cannot delete demo models'));
      return;
    }

    if (!confirm(t('predictionTool.models.deleteConfirm', 'Are you sure you want to delete this model?'))) {
      return;
    }

    try {
      await removeModel(id);
      await fetchModelsData(modelsCurrentPage);
    } catch (err) {
      console.error('Failed to delete model:', err);
      setModelsError(err instanceof Error ? err.message : t('predictionTool.models.deleteFailed', 'Failed to delete model'));
    }
  };

  const handleModelsPageChange = (page: number) => {
    setModelsCurrentPage(page);
  };

  const handleModelStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelStatus(e.target.value);
  };

  const handleClearModelsFilters = () => {
    setModelSearchKeyword('');
    setSelectedModelStatus('');
    setSelectedBaseModel('');
    setSelectedBaseModelId(undefined);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return { text: t('predictionTool.models.statusOnline', 'Online'), color: '#dcfce7', textColor: '#008236' };
      case 'trained':
        return { text: t('predictionTool.models.statusTrained', 'Trained'), color: '#dbeafe', textColor: '#1e40af' };
      case 'training':
        return { text: t('predictionTool.models.statusTraining', 'Training'), color: '#fef3c7', textColor: '#92400e' };
      case 'offline':
        return { text: t('predictionTool.models.statusOffline', 'Offline'), color: '#f3f4f6', textColor: '#6b7280' };
      case 'fail':
        return { text: t('predictionTool.models.statusFail', 'Failed'), color: '#fee2e2', textColor: '#991b1b' };
      default:
        return { text: status, color: '#f3f4f6', textColor: '#374151' };
    }
  };

  if (modelsLoading) {
    return (
      <div className="loading-state">
        <p>{t('predictionTool.models.loadingText', 'Loading models...')}</p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className="error-state">
        <p>{t('predictionTool.models.error', 'Error')}: {modelsError}</p>
      </div>
    );
  }

  return (
    <div className="models-content">
      <div className="models-filters">
        <input
          type="text"
          className="models-search-input"
          value={modelSearchKeyword}
          onChange={(e) => setModelSearchKeyword(e.target.value)}
          placeholder={t('predictionTool.models.filters.searchPlaceholder', 'Search Model ID or Name...')}
        />
        <select
          className={`models-status-filter ${selectedModelStatus ? 'has-value' : ''}`}
          value={selectedModelStatus}
          onChange={handleModelStatusChange}
          aria-label={t('predictionTool.models.filters.statusPlaceholder', 'Select Status')}
        >
          <option value="" disabled hidden>{t('predictionTool.models.filters.statusPlaceholder', 'Select Status')}</option>
          <option value="online">{t('predictionTool.models.statusOnline', 'Online')}</option>
          <option value="trained">{t('predictionTool.models.statusTrained', 'Trained')}</option>
          <option value="training">{t('predictionTool.models.statusTraining', 'Training')}</option>
          <option value="offline">{t('predictionTool.models.statusOffline', 'Offline')}</option>
          <option value="fail">{t('predictionTool.models.statusFail', 'Failed')}</option>
        </select>

        {(modelSearchKeyword || selectedModelStatus || selectedBaseModel) && (
          <button className="clear-filters-button" onClick={handleClearModelsFilters}>
            <X size={16} />
            <span>{t('predictionTool.models.filters.clearFilters', 'Clear Filters')}</span>
          </button>
        )}
        <button
          className="predictiontool-refresh-button"
          onClick={() => fetchModelsData(modelsCurrentPage)}
          aria-label={t('predictionTool.models.filters.refresh', 'Refresh')}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="models-count-text">
        {t('predictionTool.models.showingRecords', 'Showing {{count}} of {{total}} records', {
          count: modelsData.length,
          total: modelsTotal
        })}
      </div>
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th>{t('predictionTool.models.columns.modelId', 'Model ID')}</th>
              <th>{t('predictionTool.models.columns.modelName', 'Model Name')}</th>
              <th>{t('predictionTool.models.columns.status', 'Status')}</th>
              <th>{t('predictionTool.models.columns.created', 'Created Time')}</th>
              <th>{t('predictionTool.models.columns.createdBy', 'Created By')}</th>
              <th>{t('predictionTool.models.columns.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {modelsData.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  {t('predictionTool.models.noResults', 'No models found.')}
                </td>
              </tr>
            ) : (
              modelsData.map((model) => {
                const statusInfo = getStatusLabel(model.status);
                const isBaseModel = model.base_model_id === -1 || model.base_model_id === -2;
                return (
                  <tr key={model.id}>
                    <td className="record-id">PM-{String(model.id).padStart(6, '0')}</td>
                    <td className="file-name">
                      {isBaseModel ? (
                        <span>{model.model_name}</span>
                      ) : (
                        <a className="model-name-link" onClick={() => navigate(`/predict/model-detail?id=${model.id}`)}>{model.model_name}</a>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: statusInfo.color,
                          color: statusInfo.textColor,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="created-date">{formatUTCDateTime(model.created_at)}</td>
                    <td>{model.created_by_name}</td>
                    <td className="actions-cell">
                      {
                        model.base_model_id !== -1 && model.base_model_id !== -2 && (
                          <button
                            className="action-button delete-button"
                            onClick={() => handleDeleteModel(model.id.toString())}
                          >
                            {t('predictionTool.models.actions.delete', 'Delete')}
                          </button>
                        )
                      }
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        current={modelsCurrentPage}
        total={modelsTotal}
        pageSize={modelsPageSize}
        onChange={handleModelsPageChange}
      />
    </div>
  );
};

export default ModelsContent;
