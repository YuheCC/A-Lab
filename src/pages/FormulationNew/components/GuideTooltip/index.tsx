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

  useEffect(() => {
    const hasShown = localStorage.getItem(storageKey);
    if (!hasShown) {
      setIsVisible(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [storageKey]);

  const handleClose = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({ x: rect.left, y: rect.top });
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleToggle = () => {
    if (isVisible) {
      handleClose();
    } else {
      setIsVisible(true);
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
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.8807 13.3807 12 12 12V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
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
              <h3>{t('formulation.guide.title', '功能说明')}</h3>
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
            <div className="guide-tooltip-tabs">
              <button
                className={`guide-tooltip-tab ${activeTab === 'introduction' ? 'active' : ''}`}
                onClick={() => setActiveTab('introduction')}
              >
                {t('formulation.guide.tabs.introduction', 'Introduction')}
              </button>
              <button
                className={`guide-tooltip-tab ${activeTab === 'standard-properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('standard-properties')}
              >
                {t('formulation.guide.tabs.standardProperties', 'Standard Properties')}
              </button>
            </div>
            <div className="guide-tooltip-content">
              {activeTab === 'introduction' && (
                <div className="guide-tab-panel">
                  {introductionContent || (
                    <div>
                      <div>
                        <img src="/formulation/introduction1.png" alt="Introduction" />
                        Figure 1. Overview of MD workflow for the study of electrolyte formulation
  Molecular dynamics (MD) simulations connect measurable physicochemical properties with the underlying atomic- and molecular-scale interactions, with typical snapshots illustrated in Figure 1. By integrating SES’s advanced polarizable force field, we have streamlined this workflow into a hands-off, easy-access MD platform for formulation design. 
                      </div>
                      <div>
                        <img src="/formulation/introduction2.png" alt="Introduction" />
                        Figure 2. Snapshots of MD simulations at various concentrations
In this context, “formulation” refers to liquid electrolytes for Li⁺ batteries, where multiple solvents can be blended with customized additives or diluents. Using the SES MD analysis suite, illustrated in Figure 2, a full simulation run completes in about three days, after which you receive detailed property predictions for your chosen electrolyte mixtures—accelerating your design process with reliable insights. 
                      </div>

                      <div>
                        <img src="/formulation/introduction3.png" alt="Introduction" />
                        Figure 3. Workflow for the computation of properties using MD simulations trajectories
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'standard-properties' && (
                <div className="guide-tab-panel">
                  {standardPropertiesContent || (
                    <div>
                      <div>
                        <img src="/formulation/introduction3-table.png" alt="Introduction" />
                      </div>
                      <div>
                      Group 1. Standard properties 
1.Radial distribution function (RDF): Probability of finding a particle at a given distance from a reference particle, describing local structure. This has impacts on solubility, conductivity, dissolution at electrolyte-electrode interphase, and SEI.
2.Coordination number (CN): Average number of neighboring atoms/ions surrounding a central particle.
3.Solvation cluster type and fraction analysis: Group of atoms/ions or molecules aggregated through interactions, often used to analyze association.
4.Diffusivity: Rate of particle spreading due to random motion, linked to mobility.
5.Conductivity: Ability of ions/electrons to carry charge through a medium. Benchmark of ionic conductivity against experiment can be seen in Figure 3
6.Ion–ion correlation: Measure of how ionic positions and motions are correlated beyond random distribution.
7.Viscosity: Resistance of a fluid to flow or deformation under shear stress.
8.Density: Mass per unit volume, reflecting system compactness.
                        <img src="/formulation/introduction4.png" alt="Introduction" />
                        Figure 4. Summary of MD simulation settings and results
                      </div>

                      <div>
                      Group 2. Instructions needed
9.Structure factor (S(q)): Quantifies how atomic arrangements scatter radiation, revealing ordering in reciprocal space.
10.Dynamic structure factor (S(q,ω)): function describing the space-time correlations of particles.
11.Residence time: Average time an ion/molecule stays bound or in the vicinity of another species. 
                      </div>

                      <div>
                      Group 3. Advanced propertiesGroup 3. 
                      EDL (Electric Double Layer): Structured region of ions near a charged surface or electrode. Inferring the formation of SEI compound and redox reactions.
                      <img src="/formulation/introduction5.png" alt="Introduction" />
                      Figure 5. Electric double layer under well-controlled electrostatic potential. In this MD simulation, electrolyte is created between two electrodes. By mimicking the potential change across the quasi cell, surface structure under electrostatic potential can be studied.
                      </div>

                      <div>
                      13.Solubility: Maximum amount of a substance that can dissolve in a solvent under equilibrium conditions.
                      <img src="/formulation/introduction6.png" alt="Introduction" />
                      Figure 6. Performance in calculation of LiFSI solubility in various solvents.
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