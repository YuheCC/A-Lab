import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

interface GuideTooltipProps {
  storageKey: string;
  introductionContent?: React.ReactNode;
  standardPropertiesContent?: React.ReactNode;
}

const GuideTooltip: React.FC<GuideTooltipProps> = ({
  storageKey,
  introductionContent,
  standardPropertiesContent
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'introduction' | 'standard-properties'>('introduction');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasShown = localStorage.getItem(storageKey);
    if (!hasShown) {
      setIsVisible(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [storageKey]);

  const handleClose = () => {
    if (buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Calculate the offset from tooltip center to button center
      const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
      const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      // Calculate the translation needed
      const translateX = buttonCenterX - tooltipCenterX;
      const translateY = buttonCenterY - tooltipCenterY;

      setButtonPosition({ x: translateX, y: translateY });
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 500);
  };

  const handleToggle = () => {
    if (isVisible) {
      handleClose();
    } else {
      setIsVisible(true);
    }
  };

  const handleTabChange = (tab: 'introduction' | 'standard-properties') => {
    setActiveTab(tab);
    // 重置滚动条位置到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className="guide-tooltip-trigger"
        onClick={handleToggle}
        aria-label={t('formulation.guide.help', '帮助')}
      >
        <svg t="1758615454617" class="icon" viewBox="0 0 1427 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4712" width="200" height="200"><path d="M1351.064977 123.555737h-107.862689V92.969424l-36.660345-14.396103C1199.192582 75.698424 1024.753324 7.932987 872.167608 7.932987c-71.440118 0-128.592212 14.720339-170.786193 43.880012-42.193982-29.159673-99.302844-43.880012-170.764578-43.880012-152.585716 0-327.024974 67.765437-334.374335 70.640334l-36.638729 14.396103v30.586313H54.291745A43.318002 43.318002 0 0 0 10.973743 166.873739v797.81643c0 23.928657 19.389345 43.318002 43.318002 43.318001h1296.773232a43.318002 43.318002 0 0 0 43.318002-43.318001V166.873739a43.318002 43.318002 0 0 0-43.318002-43.318002z m-165.620024 8.776003v633.169114c-89.446053-30.629545-327.003358-100.03778-455.184871-25.203987V102.566825c36.141566-26.998096 87.025087-36.898118 141.907526-36.898118 143.420629 0 313.277345 66.663033 313.277345 66.663033zM1120.035635 804.971249H739.295474c74.293399-70.467408 258.243596-36.595497 380.740161 0zM530.616837 65.668707c54.860823 0 105.765959 9.921638 141.88591 36.898118v637.730042c-128.181512-74.790562-365.695585-5.425558-455.163254 25.203987V132.33174s169.856715-66.663033 313.277344-66.663033z m132.850518 739.302542H282.662347c122.453333-36.638729 306.489993-70.575487 380.805008 0z m644.27962 116.400918H97.609746V210.170125h61.994027v652.536844H1243.202288V210.170125h64.544687v711.202042z" fill="#2c2c2c" p-id="4713"></path></svg>
      </button>

      {isVisible && (
        <>
          <div
            className={`guide-tooltip-overlay ${isAnimating ? 'closing' : ''}`}
            onClick={handleClose}
          />
          <div
            ref={tooltipRef}
            className={`guide-tooltip ${isAnimating ? 'closing' : ''}`}
            style={isAnimating ? {
              '--target-x': `${buttonPosition.x}px`,
              '--target-y': `${buttonPosition.y}px`,
            } as React.CSSProperties : {}}
          >
            <div className="guide-tooltip-header">
              <div className="guide-tooltip-tabs">
                <button
                  className={`guide-tooltip-tab ${activeTab === 'introduction' ? 'active' : ''}`}
                  onClick={() => handleTabChange('introduction')}
                >
                  Introduction
                </button>
                <button
                  className={`guide-tooltip-tab ${activeTab === 'standard-properties' ? 'active' : ''}`}
                  onClick={() => handleTabChange('standard-properties')}
                >
                  Properties
                </button>
              </div>
              <button
                className="guide-tooltip-close"
                onClick={handleClose}
                aria-label={t('formulation.guide.close', '关闭')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div ref={contentRef} className="guide-tooltip-content">
              {activeTab === 'introduction' && (
                <div className="guide-tab-panel">
                  {introductionContent || (
                    <div>
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
                </div>
              )}
              {activeTab === 'standard-properties' && (
                <div className="guide-tab-panel">
                  {standardPropertiesContent || (
                    <div>
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
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GuideTooltip;