import { useMemo, useState } from 'react';
import './index.less';

const tableColumns = [
  'EL Code',
  'EC',
  'EMC',
  'DEC',
  'DMC',
  'EP',
  'LiPF6',
  'LiFSi',
  'VC',
  'FEC',
  'LiDFP',
  'sum',
];

const initialParameterValues = {
  elCode: 'MU002020',
  ec: '4.4430',
  emc: '6.2220',
  dec: '7.1100',
  dmc: '3.0000',
  ep: '3.0000',
  liPF6: '1.9200',
  liFSi: '3.0300',
  vc: '0.5700',
  fec: '0.5700',
  liDFP: '0.1350',
};

const flowRows = [
  [
    '加入EC\n(需加热到40℃溶解)',
    '加入EMC',
    '关盖混匀0.5-1min\n开盖加入DEC',
    '关盖混匀0.5-1min',
    '开盖加入DMC',
  ],
  [
    '关盖混匀0.5-1min',
    '开盖缓慢加入LiPF6\n注意这个放热\n关盖搅拌1min',
    '开盖缓慢加入LiFSi\n注意这个放热\n关盖搅拌1min',
    '开盖缓慢加入VC\n(低于20摄氏度会凝固)\n关盖搅拌1min',
    '开盖缓慢加入FEC\n关盖搅拌1min',
  ],
];

const flowLastStep = '开盖缓慢加入LiDFP\n关盖搅拌1min';

const ALabPage = () => {
  const [isParameterEditing, setIsParameterEditing] = useState(false);
  const [parameterValues, setParameterValues] = useState(initialParameterValues);

  const parameterKeys: Array<keyof typeof initialParameterValues> = [
    'elCode',
    'ec',
    'emc',
    'dec',
    'dmc',
    'ep',
    'liPF6',
    'liFSi',
    'vc',
    'fec',
    'liDFP',
  ];

  const numberKeys: Array<keyof typeof initialParameterValues> = [
    'ec',
    'emc',
    'dec',
    'dmc',
    'ep',
    'liPF6',
    'liFSi',
    'vc',
    'fec',
    'liDFP',
  ];

  const computedSum = useMemo(() => {
    const total = numberKeys.reduce((acc, key) => {
      const num = Number.parseFloat(parameterValues[key]);
      return Number.isFinite(num) ? acc + num : acc;
    }, 0);
    return total.toFixed(2);
  }, [numberKeys, parameterValues]);

  const handleParameterChange = (
    key: keyof typeof initialParameterValues,
    nextValue: string,
  ) => {
    if (key === 'elCode') {
      setParameterValues((prev) => ({ ...prev, [key]: nextValue }));
      return;
    }

    // Keep numeric fields editable while limiting to a numeric-like format.
    if (/^-?\d*\.?\d*$/.test(nextValue) || nextValue === '') {
      setParameterValues((prev) => ({ ...prev, [key]: nextValue }));
    }
  };

  return (
    <div className="a-lab-page">
      <h1 className="a-lab-page-title">A-Lab</h1>

      <section className="a-lab-card">
        <div className="a-lab-card-header">
          <h2 className="a-lab-title">实验参数</h2>
          <button
            type="button"
            className="a-lab-edit-button"
            onClick={() => setIsParameterEditing((prev) => !prev)}
          >
            {isParameterEditing ? '完成' : '编辑'}
          </button>
        </div>
        <div className="a-lab-table-wrapper">
          <table className="a-lab-table">
            <thead>
              <tr>
                {tableColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {parameterKeys.map((key, index) => {
                  if (key === 'elCode') {
                    return (
                      <td key={key}>
                        {isParameterEditing ? (
                          <input
                            className="a-lab-cell-input"
                            value={parameterValues.elCode}
                            onChange={(e) => handleParameterChange('elCode', e.target.value)}
                          />
                        ) : (
                          parameterValues.elCode
                        )}
                      </td>
                    );
                  }

                  return (
                    <td key={key}>
                      {isParameterEditing ? (
                        <input
                          className="a-lab-cell-input"
                          value={parameterValues[key]}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                        />
                      ) : (
                        parameterValues[key]
                      )}
                    </td>
                  );
                })}
                <td key={`sum-${computedSum}-${isParameterEditing}`}>{computedSum}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="a-lab-card">
        <div className="a-lab-card-header">
          <h2 className="a-lab-title">实验流程</h2>
          <button type="button" className="a-lab-edit-button">
            编辑
          </button>
        </div>
        <div className="a-lab-flow">
          <div className="flow-row">
            {flowRows[0].map((text, index) => (
              <div key={`row1-step-${index}`} className="flow-row-item">
                <div className="flow-step">{text}</div>
                {index < flowRows[0].length - 1 && (
                  <span className="flow-inline-arrow" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flow-arrow-down right-column-arrow">↓</div>

          <div className="flow-row flow-row-reverse">
            {flowRows[1].map((text, index) => (
              <div key={`row2-step-${index}`} className="flow-row-item">
                <div className="flow-step">{text}</div>
                {index < flowRows[1].length - 1 && (
                  <span className="flow-inline-arrow" aria-hidden>
                    ←
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flow-arrow-down left-column-arrow">↓</div>

          <div className="flow-last-row">
            <div className="flow-step flow-last-step">{flowLastStep}</div>
          </div>
        </div>
      </section>

      <div className="a-lab-footer">
        <button type="button" className="a-lab-submit-button">
          提交
        </button>
      </div>
    </div>
  );
};

export default ALabPage;
