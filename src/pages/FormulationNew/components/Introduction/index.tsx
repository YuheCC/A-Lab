import React from 'react';
import './index.css';

const Introduction: React.FC = () => {
  return (
    <div className="introduction-container">
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
          <li><strong>Solvation cluster type and fraction analysis</strong>: Analyzes how cations and anions associate in electrolyte solutions:
            <br />• <strong>SSIP (Solvent-Separated Ion Pair)</strong>: Cation-anion correlated but at least one solvent molecule sits between. Favored in high-dielectric solvents; supports higher Li⁺ mobility.
            <br />• <strong>CIP (Contact Ion Pair)</strong>: Cation-anion directly contact, no solvent in between. More common at higher salt concentration; can slow down ion transport.
            <br />• <strong>AGG (Aggregate)</strong>: Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes; often reduces conductivity.
            <br />The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to ionic conductivity, viscosity, and Li⁺ transport behavior.
            <div className="cluster-illustration">
              <img src="/formulation/cluster-illustration.jpg" alt="Solvation cluster types illustration" />
              <div className="figure-caption">Figure 3. Illustration of different solvation cluster types (SSIP, CIP, AGG) and their impact on ion transport</div>
            </div>
          </li>
          <li><strong>Diffusivity</strong>: Rate of particle spreading due to random motion, linked to mobility.</li>
          <li><strong>Conductivity</strong>: Ability of ions/electrons to carry charge through a medium. Benchmark of ionic conductivity against experiment can be seen in Figure 4</li>
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
  );
};

export default Introduction;