import React from 'react';
import PropertiesTable from '../PropertiesTable';
import './index.css';

const Introduction: React.FC = () => {
  return (
    <div className="introduction-container">
      <div className="guide-content-section">
        <img src="/formulation/introduction1.png" alt="Introduction" />
        <div className="figure-caption">Our proprietary Molecular Dynamics (MD) service for electrolyte formulation</div>
        <p>Molecular dynamics (MD) simulations in SES’s platform uniquely combine advanced polarizable force fields with an automated workflow, capturing ion–solvent interactions with high fidelity. Users simply submit electrolyte formulations through the MU portal, and within days receive quantitative predictions of key properties—delivering faster, more reliable insights than conventional trial-and-error or standard modeling approaches.</p>
      </div>
      <div className="guide-content-section">
        <img src="/formulation/introduction2.png" alt="Introduction" />
        <div className="figure-caption">Accelerating electrolyte design with MD simulations across concentrations</div>
        <p>SES’s proprietary MD service provides molecular-level snapshots of electrolyte formulations, capturing how Li⁺, anions, and solvents organize at different salt concentrations. Each simulation run completes in ~3 days, after which customers receive quantitative property predictions—delivering fast, reliable insights to guide electrolyte design and optimization beyond traditional trial-anderror approaches.</p>
      </div>
      <div className="guide-content-section">
        <PropertiesTable />
      </div>
      <div className="guide-content-section">
        <h4>Group 1. Standard properties</h4>
        <ol>
          <li><strong>Radial distribution function (RDF)</strong>: Probability of finding a particle at a given distance from a reference particle, describing local structure. This has impacts on solubility, conductivity, dissolution at electrolyte-electrode interphase, and SEI.</li>
          <li><strong>Coordination number (CN)</strong>: Average number of neighboring atoms/ions surrounding a central particle.</li>
          <li><strong>Solvation cluster type and fraction analysis</strong>: Analyzes how cations and anions associate in electrolyte solutions:
            <br />• <strong>SSIP (Solvent-Separated Ion Pair)</strong>: Cation-anion correlated but at least one solvent molecule sits between. Favored in high-dielectric solvents; supports higher Li⁺ mobility.
            <br />• <strong>CIP (Contact Ion Pair)</strong>: Cation-anion directly contact, no solvent in between. More common at higher salt concentration; can slow down ion transport.
            <br />• <strong>AGG (Aggregate)</strong>: Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes; often reduces conductivity.
            <br />The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to ionic conductivity, viscosity, and Li⁺ transport behavior.
            <div className="cluster-illustration">
              <img src="/formulation/cluster-illustration.jpg" alt="Solvation cluster types illustration" />
              <div className="figure-caption">Illustration of different solvation cluster types (SSIP, CIP, AGG) and their impact on ion transport</div>
            </div>
          </li>
          <li><strong>Diffusivity</strong>: Rate of particle spreading due to random motion, linked to mobility.</li>
          <li><strong>Conductivity</strong>: Ability of ions/electrons to carry charge through a medium. As shown in the figure below, our MD-calculated ionic conductivity aligns well with experimental benchmarks, providing reliable predictions for electrolyte design.</li>
          <li><strong>Ion–ion correlation</strong>: Measure of how ionic positions and motions are correlated beyond random distribution.</li>
          <li><strong>Viscosity</strong>: Resistance of a fluid to flow or deformation under shear stress.</li>
          <li><strong>Density</strong>: Mass per unit volume, reflecting system compactness.</li>
        </ol>
        <img src="/formulation/introduction4.png" alt="MD simulation results" />
        <div className="figure-caption">Summary of MD simulation settings and results</div>
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
        <div className="figure-caption">Electric double layer under well-controlled electrostatic potential. In this MD simulation, electrolyte is created between two electrodes. By mimicking the potential change across the quasi cell, surface structure under electrostatic potential can be studied.</div>

        <ol start={13}>
          <li><strong>Solubility</strong>: Maximum amount of a substance that can dissolve in a solvent under equilibrium conditions.</li>
        </ol>
        <img src="/formulation/introduction6.png" alt="Solubility calculation" />
        <div className="figure-caption">Performance in calculation of LiFSI solubility in various solvents.</div>
      </div>
    </div>
  );
};

export default Introduction;