import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getMDHistoryList, deleteMDHistory, MDHistoryItem } from '@/services/formulation/md';
import './index.css';
import { normalizeServerDate } from "@/utils/messageUtils";
import { formatIonDisplay } from './utils';
import GuideTooltip from './components/GuideTooltip';

interface FormulationTableProps {}

const FormulationNew: React.FC<FormulationTableProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<MDHistoryItem[]>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);
  const [activeTab, setActiveTab] = useState<'introduction' | 'properties' | 'analysis'>('introduction');

  // 获取历史记录数据
  const fetchHistoryData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMDHistoryList({ page, page_size: pageSize });

      if (response && response.data && response.data.data) {
        setHistoryData(response.data.data);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error('Failed to fetch MD history:', err);
      setError(err instanceof Error ? err.message : t('formulation.history.loading.error', '获取历史记录失败'));
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData(currentPage);
  }, [currentPage]);

  // 格式化浓度显示
  const formatConcentration = (value: number) => {
    return `${value} mol/kg`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化状态
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'completed': { text: t('formulation.status.completed', '已完成'), className: 'status-completed' },
      'success': { text: t('formulation.status.success', '已完成'), className: 'status-completed' },
      'running': { text: t('formulation.status.running', '运行中'), className: 'status-running' },
      'failed': { text: t('formulation.status.failed', '失败'), className: 'status-failed' },
      'pending': { text: t('formulation.status.pending', '等待中'), className: 'status-pending' }
    };
    return statusMap[status] || { text: status, className: 'status-unknown' };
  };

  // 处理删除记录
  const handleDeleteRecord = async (id: number) => {
    if (!confirm(t('formulation.history.actions.deleteConfirm', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      const response = await deleteMDHistory(id);
      if (response && response.status < 400) {
        await fetchHistoryData(currentPage);
      } else {
        setError(t('formulation.history.actions.deleteFailed', '删除记录失败'));
      }
    } catch (err) {
      console.error('Failed to delete MD history:', err);
      setError(err instanceof Error ? err.message : t('formulation.history.actions.deleteFailed', '删除记录失败'));
    }
  };

  // 处理新建分析
  const handleNewAnalysis = () => {
    navigate('/formulation/create');
  };

  // 处理查看详情
  const handleViewDetails = (record: MDHistoryItem) => {
    navigate(`/formulation/detail?id=${record.id}`);
  };

  // 处理tab切换
  const handleTabChange = (tab: 'introduction' | 'properties' | 'analysis') => {
    setActiveTab(tab);
  };

  return (
    <div className="formulation-new-container">
      <div className="formulation-header">
        <div className="formulation-title-wrapper">
          <h1 className="formulation-title">
            {t('formulation.title', 'Salt & Solvent Configuration')}
          </h1>
          <GuideTooltip
            storageKey="formulation-new-guide-shown"
          />
        </div>
        <span className="formulation-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="formulation-new-table-container">
        <div className="formulation-tabs-header">
          <div className="formulation-tabs">
            <button
              className={`formulation-tab ${activeTab === 'introduction' ? 'active' : ''}`}
              onClick={() => handleTabChange('introduction')}
            >
              Introduction
            </button>
            <button
              className={`formulation-tab ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => handleTabChange('properties')}
            >
              Properties
            </button>
            <button
              className={`formulation-tab ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => handleTabChange('analysis')}
            >
              {t('formulation.tabs.analysis', 'Analysis History')}
            </button>
          </div>
        </div>

        <div className="formulation-tab-content">
          {activeTab === 'introduction' && (
            <div className="formulation-tab-panel">
              <div className="guide-content-section">
                <img src="/formulation/introduction1.png" alt="Introduction" />
                <div className="figure-caption">Figure 1. Overview of MD workflow for the study of electrolyte formulation</div>
                <p>Molecular dynamics (MD) simulations connect measurable physicochemical properties with the underlying atomic- and molecular-scale interactions, with typical snapshots illustrated in Figure 1. By integrating SES's advanced polarizable force field, we have streamlined this workflow into a hands-off, easy-access MD platform for formulation design.</p>
              </div>
              <div className="guide-content-section">
                <img src="/formulation/introduction2.png" alt="Introduction" />
                <div className="figure-caption">Figure 2. Snapshots of MD simulations at various concentrations</div>
                <p>In this context, "formulation" refers to liquid electrolytes for Li⁺ batteries, where multiple solvents can be blended with customized additives or diluents. Using the SES MD analysis suite, illustrated in Figure 2, a full simulation run completes in about three days, after which you receive detailed property predictions for your chosen electrolyte mixtures—accelerating your design process with reliable insights.</p>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="formulation-tab-panel">
              <div className="guide-content-section">
                <img src="/formulation/introduction3.png" alt="Introduction" />
                <div className="figure-caption">Figure 3. Workflow for the computation of properties using MD simulations trajectories</div>
              </div>
              <div className="guide-content-section">
                <table className="properties-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Estimated Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Radial distribution function (RDF)</td>
                      <td>Structural</td>
                      <td rowSpan={8} className="time-cell">3 Days</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Coordination number</td>
                      <td>Structural</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Solvation cluster type and fraction analysis</td>
                      <td>Structural</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Diffusivity</td>
                      <td>Dynamic</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Conductivity</td>
                      <td>Dynamic</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Ion–ion correlation</td>
                      <td>Dynamic</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>Viscosity</td>
                      <td>Dynamic</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td>Density</td>
                      <td>Structural</td>
                    </tr>
                    <tr>
                      <td>9</td>
                      <td>Structure factor (S(q))</td>
                      <td>Structural</td>
                      <td rowSpan={3} className="time-cell">1 Week</td>
                    </tr>
                    <tr>
                      <td>10</td>
                      <td>Dynamic structure factor (S(q,ω))</td>
                      <td>Structural + Dynamic</td>
                    </tr>
                    <tr>
                      <td>11</td>
                      <td>Residence time</td>
                      <td>Dynamic</td>
                    </tr>
                    <tr>
                      <td>12</td>
                      <td>EDL (Electric Double Layer)</td>
                      <td>Thermodynamic</td>
                      <td rowSpan={2} className="time-cell">1-2 Weeks</td>
                    </tr>
                    <tr>
                      <td>13</td>
                      <td>Solubility</td>
                      <td>Thermodynamic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="guide-content-section">
                <h4>Group 1. Standard properties</h4>
                <ol>
                  <li><strong>Radial distribution function (RDF)</strong>: Probability of finding a particle at a given distance from a reference particle, describing local structure. This has impacts on solubility, conductivity, dissolution at electrolyte-electrode interphase, and SEI.</li>
                  <li><strong>Coordination number (CN)</strong>: Average number of neighboring atoms/ions surrounding a central particle.</li>
                  <li><strong>Solvation cluster type and fraction analysis</strong>: Group of atoms/ions or molecules aggregated through interactions, often used to analyze association.</li>
                  <li><strong>Diffusivity</strong>: Rate of particle spreading due to random motion, linked to mobility.</li>
                  <li><strong>Conductivity</strong>: Ability of ions/electrons to carry charge through a medium. Benchmark of ionic conductivity against experiment can be seen in Figure 3</li>
                  <li><strong>Ion–ion correlation</strong>: Measure of how ionic positions and motions are correlated beyond random distribution.</li>
                  <li><strong>Viscosity</strong>: Resistance of a fluid to flow or deformation under shear stress.</li>
                  <li><strong>Density</strong>: Mass per unit volume, reflecting system compactness.</li>
                </ol>
                <img src="/formulation/introduction4.png" alt="MD simulation results" />
                <div className="figure-caption">Figure 4. Summary of MD simulation settings and results</div>
              </div>

              <div className="guide-content-section">
                <h4>Group 2. Instructions needed</h4>
                <ol start={9}>
                  <li><strong>Structure factor (S(q))</strong>: Quantifies how atomic arrangements scatter radiation, revealing ordering in reciprocal space.</li>
                  <li><strong>Dynamic structure factor (S(q,ω))</strong>: function describing the space-time correlations of particles.</li>
                  <li><strong>Residence time</strong>: Average time an ion/molecule stays bound or in the vicinity of another species.</li>
                </ol>
              </div>

              <div className="guide-content-section">
                <h4>Group 3. </h4>
                <p>12. <strong>EDL (Electric Double Layer)</strong>: Structured region of ions near a charged surface or electrode. Inferring the formation of SEI compound and redox reactions.</p>
                <img src="/formulation/introduction5.png" alt="Electric Double Layer" />
                <div className="figure-caption">Figure 5. Electric double layer under well-controlled electrostatic potential. In this MD simulation, electrolyte is created between two electrodes. By mimicking the potential change across the quasi cell, surface structure under electrostatic potential can be studied.</div>

                <ol start={13}>
                  <li><strong>Solubility</strong>: Maximum amount of a substance that can dissolve in a solvent under equilibrium conditions.</li>
                </ol>
                <img src="/formulation/introduction6.png" alt="Solubility calculation" />
                <div className="figure-caption">Figure 6. Performance in calculation of LiFSI solubility in various solvents.</div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="formulation-tab-panel">
              <button className="new-analysis-button" onClick={handleNewAnalysis}>
                + {t('formulation.history.newAnalysis', 'New Analysis')}
              </button>
              {loading ? (
                <div className="loading-state">
                  <p>{t('formulation.history.loading.message', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('formulation.history.loading.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>{t('formulation.list.columns.analysisId', 'Analysis ID')}</th>
                      <th>{t('formulation.list.columns.saltFraction', 'Salt (Fraction)')}</th>
                      <th>{t('formulation.list.columns.saltFractionType', 'Fraction Type (Salt)')}</th>
                      <th>{t('formulation.list.columns.solventFraction', 'Solvent (Fraction)')}</th>
                      <th>{t('formulation.list.columns.solventFractionType', 'Fraction Type (Solvent)')}</th>
                      <th>{t('formulation.list.columns.concentration', 'Concentration')}</th>
                      <th>{t('formulation.list.columns.created', 'Created')}</th>
                      <th>{t('formulation.list.columns.status', 'Status')}</th>
                      <th>{t('formulation.list.columns.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="no-data">
                          {t('formulation.history.noResults.message', 'No analysis records found.')}
                        </td>
                      </tr>
                    ) : (
                      historyData.map((record) => {
                        const statusInfo = formatStatus(record.status);
                        return (
                          <tr key={record.id}>
                            <td className="analysis-id">AN-{String(record.id).padStart(3, '0')}</td>
                            <td className="salt-info">
                              <div className="compound-list">
                                {formatIonDisplay(record.cation_name)}
                                {record.anion_name_list.map((anion, idx) => (
                                  <div key={idx} className="compound-item">
                                    {formatIonDisplay(anion)}({record.anion_fractions[idx]})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td>{record.anion_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</td>
                            <td className="solvent-info">
                              <div className="compound-list">
                                {record.solvent_smiles_list.map((solvent, idx) => (
                                  <div key={idx} className="compound-item">
                                    {solvent}({record.solvent_fractions[idx]})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td>{record.solvent_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</td>
                            <td>{formatConcentration(record.cation_molality)}</td>
                            <td className="created-date">{formatDate(normalizeServerDate(record.created_at).toISOString())}</td>
                            <td>
                              <span className={`status-badge ${statusInfo.className}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td className="actions-cell">
                              {record.status === 'success' && (
                              <button
                                className="action-button view-button"
                                onClick={() => handleViewDetails(record)}
                              >
                                {t('formulation.history.actions.viewDetails', 'View Details')}
                              </button>
                              )}
                              <button
                                className="action-button delete-button"
                                onClick={() => handleDeleteRecord(record.id)}
                              >
                                {t('formulation.history.actions.delete', 'Delete')}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulationNew;