import React from 'react';
import { X } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileRecord: {
    id: string;
    name: string;
    date: string;
    batteryCount: number;
    avgCirculation: string;
  } | null;
}

interface PredictionResult {
  barcode: string;
  predictedCycleLife: number;
}

const mockPredictionResults: PredictionResult[] = [
  { barcode: 'ISU-LLCC_663C4', predictedCycleLife: 290 },
  { barcode: 'BT-NCM811_A2B5', predictedCycleLife: 312 },
  { barcode: 'LFP-456_X7Y9', predictedCycleLife: 268 },
  { barcode: 'NCM-622_M4N8', predictedCycleLife: 295 },
  { barcode: 'LTO-789_P3Q6', predictedCycleLife: 343 },
  { barcode: 'NCA-123_R5S2', predictedCycleLife: 261 }
];

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, fileRecord }) => {
  if (!isOpen || !fileRecord) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">预测记录详情 - 历史数据</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="modal-section">
            <h4 className="section-title">上传数据</h4>
            <div className="uploaded-file-info">
              <div className="file-link">
                {fileRecord.name}
              </div>
            </div>
          </div>
          
          <div className="modal-section">
            <h4 className="section-title">预测结果</h4>
            
            <div className="results-stats-card">
              <div className="results-stats">
                <div className="stats-card">
                  <div className="stats-label">电芯数量</div>
                  <div className="stats-value">{fileRecord.batteryCount}个</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">平均循环寿命</div>
                  <div className="stats-value">{fileRecord.avgCirculation}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">预测时间</div>
                  <div className="stats-value">{fileRecord.date}</div>
                </div>
              </div>
            </div>
            
            <div className="results-table-card">
              <div className="results-table">
                <table className="prediction-table">
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Predicted Cycle Life</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPredictionResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.barcode}</td>
                        <td>{result.predictedCycleLife}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;