import React from 'react';
import PropertiesTable from '../PropertiesTable';
import './index.less';

const Introduction: React.FC = () => {
  return (
    <div className="introduction-container">
      <div className="guide-content-section">
        <img src="/formulation/introduction1.png" alt="Introduction" />
        <div className="figure-caption">[Caption] Our proprietary Molecular Dynamics (MD) service for electrolyte formulation</div>
        <p>Molecular dynamics (MD) simulations in MU's platform uniquely combine advanced polarizable force fields with an automated workflow, capturing ion–solvent interactions with high fidelity. Users simply submit desired electrolyte formulations through the MU portal containing any known or unknown molecules, and within days will receive quantitative predictions of key properties—delivering faster and more accurate insights than conventional trial-and-error or classical modeling approaches.</p>
      </div>
      <div className="guide-content-section">
        <img src="/formulation/introduction2.png" alt="Introduction" />
        <div className="figure-caption">[Caption] Accelerating electrolyte design with MD simulations across concentrations</div>
        <p>MU's proprietary MD service provides molecular-level snapshots of electrolyte formulations, capturing how Li⁺, anions, and solvent molecules organize at different salt concentrations.</p>
        <p>Each standard simulation run completes in ~3 days depending on the complexity of the formulation, after which customers receive quantitative property predictions—delivering fast and reliable insights to guide electrolyte design and optimization, which saves tremendous cost and time.</p>
      </div>
      <div className="guide-content-section">
        <PropertiesTable />
        <div className="properties-tip-section">
          <div className="introduction-properties-tip">
            Properties listed as Standard Properties will be available in about 3 days as soon as the MD simulations are complete. For other properties, please contact our team.
          </div>
          <div className="email-contact">
            <a
              href="mailto:md-service@ses.ai"
              className="email-button"
            >
              md-service@ses.ai
            </a>
          </div>
        </div>
      </div>
      <div className="guide-content-section">
        <h4>Standard Properties</h4>
        <ol>
          <li><strong>Radial distribution function (RDF)</strong>: Probability of finding a particle at a given distance from a reference particle. RDF describes local structure of electrolytes, which directly impacts solubility, miscibility, ion conductivity, solvation structure and interphases.</li>
          <li><strong>Coordination number (CN)</strong>: Average number of neighboring atoms/molecules surrounding a central ion. This has impact on conductivity, solubility and interphases.</li>
          <li><strong>Solvation cluster analysis</strong>: Analyzes how cations and anions associate in electrolyte solutions. Three major cluster types:
            <br />• <strong>SSIP (Solvent-Separated Ion Pair)</strong>: Cation-anion associated but with at least one solvent molecule sits between them. Such species prevail in high-dielectric solvents; supports higher Li⁺ mobility and typically higher conductivity.
            <br />• <strong>CIP (Contact Ion Pair)</strong>: Cation–anion forms direct contact with no solvent molecules in between. Such species are more common at higher salt concentration or in solvents of low dielectric constants; their existence can slow down ion transport, leading to typically lower conductivity.
            <br />• <strong>AGG (Aggregate)</strong>: Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes; often reduces conductivity.
            <br />The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to viscosity, and Li⁺ transport behavior such as ion conductivity, transference number.
            <div className="cluster-illustration">
              <img src="/formulation/cluster-illustration.jpg" alt="Solvation cluster types illustration" />
              <div className="figure-caption">Representative Li solvate clusters</div>
            </div>
          </li>
          <li><strong>Diffusivity</strong>: Rate at which particles move randomly in the absence of an electric field, closely related to migration properties like mobility.</li>
          <li><strong>Conductivity</strong>: Ability of ions or other charged particles to carry charges through a medium under the action of electric field. Benchmark of predicted ionic conductivity against experimental values can be seen in the following figure.</li>
          <li><strong>Viscosity</strong>: Resistance of a fluid to flow or deformation under shear stress.</li>
          <li><strong>Density</strong>: Mass per unit volume, reflecting system compactness.</li>
        </ol>
        <img src="/formulation/introduction4.png" alt="MD simulation results" />
        <div className="figure-caption">MD Simulation Accuracy: Predicted vs. Measured Ionic Conductivity</div>
        <p>
        Our molecular dynamics simulations (blue points) show excellent agreement with experimental ionic conductivity measurements across more than 100 electrolyte formulations spanning 0–40 mS cm⁻¹. The benchmark includes a wide variety of common and novel solvents— sulfone, sulfite, ether, ester, carbonate, nitrile, siloxane, borate, phosphate ester.
        </p>
        <p>
        In contrast, the external machine-learning force field (MLFF, open circles) has been benchmarked only on a small subset of carbonate systems. Our force field achieves accuracy on par with, and in many cases exceeding, the MLFF in those carbonate systems, while also demonstrating high predictive power across a far broader chemical space where the MLFF's performance remains untested.
        </p>
        <p>
        Points lying near the black diagonal (y = x) confirm the reliability of our simulation-based screening before synthesis.
        </p>
      </div>

      <div className="guide-content-section">
        <h4>Advanced Analysis</h4>
        <ol start={8}>
        <li><strong>Ion–ion correlation</strong>: Measure of how ionic species are correlated beyond random distribution.</li>
          <li><strong>Structure factor (S(q))</strong>: Quantifies how atomic arrangements scatter radiation, revealing ordering in reciprocal space.</li>
          <li><strong>Dynamic structure factor (S(q,ω))</strong>: Function describing the space-time correlations of particles.</li>
          <li><strong>Residence time</strong>: Average time an ion/molecule stays bound or in the vicinity of another species.</li>
        </ol>
      </div>

      <div className="guide-content-section">
        <h4>Custom Studies</h4>
        <ol start={12}>
          <li><strong>EDL (Electric Double Layer)</strong>: Structured region of ions near a charged surface or electrode. Inferring the formation of SEI compound and redox reactions.</li>
        </ol>
        <img src="/formulation/introduction5.png" alt="Electric Double Layer" />
        <div className="figure-caption">Electric double layer structure under well-controlled electrostatic potential. In this snapshot of MD simulation, electrolyte of given formulation from the user is placed between two electrodes. By mimicking the potential change across the virtual cell, surface structure under electrostatic potential can be visualized, whose chemical distribution predetermines the eventual interphasial chemistries.</div>

        <ol start={13}>
          <li><strong>Solubility</strong>: Maximum amount of a salt or a molecular species that can be homogenously distributed (i.e., dissolved or blended) in a given medium under equilibrium conditions.</li>
        </ol>
        <img src="/formulation/introduction6.png" alt="Solubility calculation" />
        <div className="figure-caption">Our MD Simulations accurately predicts the solubility of a typical lithium salt LiFSI in 19 solvents of diverse chemical structures and functional groups. Points close to the diagonal line indicate high prediction accuracy, giving you confidence in simulation-based screening before synthesis.</div>
      </div>
    </div>
  );
};

export default Introduction;