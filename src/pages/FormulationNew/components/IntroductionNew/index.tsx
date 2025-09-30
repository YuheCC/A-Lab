import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import PropertiesTable from '../PropertiesTable';
import './index.css';

const IntroductionNew: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="introduction-new-container">
      {/* Function Introduction Section */}
      <div className="function-intro-section">
        <h2 className="section-title">Function Introduction</h2>
        <p className="section-description">
          Molecular dynamics (MD) simulations in MU’s platform uniquely combine advanced polarizable force fields with an automated workflow, capturing ion–solvent interactions with high fidelity. Users simply submit desired electrolyte formulations through the MU portal containing any known or unknown molecules, and within days will receive quantitative predictions of key properties—delivering faster and more accurate insights than conventional trial-and-error or classical modeling approaches.
        </p>

        {/* MD Service Workflow Image */}
        <div className="content-image-section">
          <img
            src="/formulation/introduction1.png"
            alt="MD simulation workflow"
            className="content-image"
          />
          <div className="image-caption">
            [Caption] Our proprietary Molecular Dynamics (MD) service for electrolyte formulation
          </div>
        </div>
      </div>

      {/* MD Service Benefits Section */}
      <div className="content-section">
        <div className="content-layout">
          <div className="content-text" style={{ paddingTop: '45px' }}>
            <p className="content-description">
              MU’s proprietary MD service provides molecular-level snapshots of electrolyte formulations, capturing how Li⁺, anions, and solvent molecules organize at different salt concentrations.
            </p>
            <p className="content-description">
              Each standard simulation run completes in ~3 days depending on the complexity of the formulation, after which customers receive quantitative property predictions—delivering fast and reliable insights to guide electrolyte design and optimization, which saves tremendous cost and time.
            </p>
          </div>
          <div className="content-image-section">
            <img
              src="/formulation/introduction2.png"
              alt="MD simulation across concentrations"
              className="content-image"
            />
            <div className="image-caption">
              [Caption] Accelerating electrolyte design with MD simulations across concentrations
            </div>
          </div>
        </div>
      </div>

      {/* Properties Introduction Section */}
      <div className="content-section">
        <h2 className="section-title">Properties Introduction</h2>
        <div className="properties-table-container">
          <PropertiesTable />
        </div>
        <div className="properties-note">
          <p className="note-text">
            <Info size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
            <span>Properties listed as Standard Properties will be available in about 3 days as soon as the MD simulations are complete. For other properties, please contact our team.</span>
          </p>
          <button className="contact-team-button">
            Contact Team
          </button>
        </div>
      </div>

      {/* Group 1: Standard Properties */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">Standard Properties</h2>
        </div>

        {/* Property 01: RDF */}
        <div className="property-item">
          <div className="property-number">01</div>
          <h3 className="property-title">Radial distribution function (RDF)</h3>
          <p className="property-description">
            Probability of finding a particle at a given distance from a reference particle. RDF describes local structure of electrolytes, which directly impacts solubility, miscibility, ion conductivity, solvation structure and interphases. 
          </p>
        </div>

        {/* Property 02: CN */}
        <div className="property-item">
          <div className="property-number">02</div>
          <h3 className="property-title">Coordination number (CN)</h3>
          <p className="property-description">
           Average number of neighboring atoms/molecules surrounding a central ion. This has impact on conductivity, solubility and interphases.
          </p>
        </div>

        {/* Property 03: Solvation cluster analysis */}
        <div className="property-item property-item-cluster">
          <div className="property-number">03</div>
          <h3 className="property-title">Solvation cluster analysis</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Analyzes how cations and anions associate in electrolyte solutions. Three major cluster types: 
            </p>

            {/* SSIP */}
            <div className="cluster-type">
              <div className="cluster-badge">SSIP</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Solvent-Separated Ion Pair</h4>
                <p className="cluster-desc">
                 Cation-anion associated but with at least one solvent molecule sits between them. Such species prevail in high-dielectric solvents; supports higher Li⁺ mobility and typically higher conductivity.
                </p>
              </div>
            </div>

            {/* CIP */}
            <div className="cluster-type">
              <div className="cluster-badge">CIP</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Contact Ion Pair</h4>
                <p className="cluster-desc">
                 Cation–anion forms direct contact with no solvent molecules in between. Such species are more common at higher salt concentration or in solvents of low dielectric constants; their existence can slow down ion transport, leading to typically lower conductivity.
                </p>
              </div>
            </div>

            {/* AGG */}
            <div className="cluster-type">
              <div className="cluster-badge">AGG</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Aggregate</h4>
                <p className="cluster-desc">
                 Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes; often reduces conductivity. 
                </p>
              </div>
            </div>

            {/* Cluster Illustration */}
            <div className="cluster-illustration">
              <img
                src="/formulation/cluster-illustration.jpg"
                alt="Representative Li solvate clusters"
                className="cluster-image"
              />
              <div className="image-caption">Representative Li solvate clusters</div>
            </div>

            <p className="cluster-summary">
              The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to viscosity, and Li⁺ transport behavior such as ion conductivity, transference number.
            </p>
          </div>
        </div>

        {/* Property 04: Diffusivity */}
        <div className="property-item">
          <div className="property-number">04</div>
          <h3 className="property-title">Diffusivity</h3>
          <p className="property-description">
            Rate at which particles move randomly in the absence of an electric field, closely related to migration properties like mobility. 
          </p>
        </div>

        {/* Property 05: Conductivity */}
        <div className="property-item property-item-with-image">
          <div className="property-number">05</div>
          <h3 className="property-title">Conductivity</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Ability of ions or other charged particles to carry charges through a medium under the action of electric field. Benchmark of predicted ionic conductivity against experimental values can be seen in the following figure.  
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction4.png"
                alt="MD Simulation Accuracy"
                className="property-image"
              />
              <div className="image-caption">MD Simulation Accuracy: Predicted vs. Measured Ionic Conductivity</div>
              <p className="image-description">
                Our molecular dynamics simulations (blue points) show excellent agreement with experimental ionic conductivity measurements across more than 100 electrolyte formulations spanning 0–40 mS cm⁻¹. The benchmark includes a wide variety of common and novel solvents— sulfone, sulfite, ether, ester, carbonate, nitrile, siloxane, borate, phosphate ester. 
              </p>
              <p className="image-description">
                In contrast, the external machine-learning force field (MLFF, open circles) has been benchmarked only on a small subset of carbonate systems. Our force field achieves accuracy on par with, and in many cases exceeding, the MLFF in those carbonate systems, while also demonstrating high predictive power across a far broader chemical space where the MLFF’s performance remains untested. 
              </p>
              <p className="image-description">
                Points lying near the black diagonal (y = x) confirm the reliability of our simulation-based screening before synthesis. 
              </p>
            </div>
          </div>
        </div>

        {/* Property 06: Viscosity */}
        <div className="property-item">
          <div className="property-number">06</div>
          <h3 className="property-title">Viscosity</h3>
          <p className="property-description">
            Resistance of a fluid to flow or deformation under shear stress.
          </p>
        </div>

        {/* Property 07: Density */}
        <div className="property-item">
          <div className="property-number">07</div>
          <h3 className="property-title">Density</h3>
          <p className="property-description">
            Mass per unit volume, reflecting system compactness.
          </p>
        </div>
      </div>

      {/* Group 2: Instructions Needed */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">Advanced Analysis</h2>
        </div>

        {/* Property 08: Ion–ion correlation */}
        <div className="property-item">
          <div className="property-number">08</div>
          <h3 className="property-title">Ion–ion correlation</h3>
          <p className="property-description">
            Measure of how ionic species are correlated beyond random distribution. 
          </p>
        </div>

        {/* Property 09: Structure factor */}
        <div className="property-item">
          <div className="property-number">09</div>
          <h3 className="property-title">Structure factor (S(q))</h3>
          <p className="property-description">
            Quantifies how atomic arrangements scatter radiation, revealing ordering in reciprocal space.
          </p>
        </div>

        {/* Property 10: Dynamic structure factor */}
        <div className="property-item">
          <div className="property-number">10</div>
          <h3 className="property-title">Dynamic structure factor (S(q,ω))</h3>
          <p className="property-description">
            Function describing the space-time correlations of particles. 
          </p>
        </div>

        {/* Property 11: Residence time */}
        <div className="property-item">
          <div className="property-number">11</div>
          <h3 className="property-title">Residence time</h3>
          <p className="property-description">
            Average time an ion/molecule stays bound or in the vicinity of another species.  
          </p>
        </div>
      </div>

      {/* Group 3: Advanced Properties */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">Custom Studies</h2>
        </div>

        {/* Property 12: EDL */}
        <div className="property-item property-item-with-image">
          <div className="property-number">12</div>
          <h3 className="property-title">EDL (Electric Double Layer)</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Structured region of ions near a charged surface or electrode. Inferring the formation of SEI compound and redox reactions.
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction5.png"
                alt="Electric Double Layer"
                className="property-image"
              />
              <div className="image-caption">
                Electric double layer structure under well-controlled electrostatic potential. In this snapshot of MD simulation, electrolyte of given formulation from the user is placed between two electrodes. By mimicking the potential change across the virtual cell, surface structure under electrostatic potential can be visualized, whose chemical distribution predetermines the eventual interphasial chemistries.
              </div>
            </div>
          </div>
        </div>

        {/* Property 13: Solubility */}
        <div className="property-item property-item-with-image">
          <div className="property-number">13</div>
          <h3 className="property-title">Solubility</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Maximum amount of a salt or a molecular species that can be homogenously distributed (i.e., dissolved or blended) in a given medium under equilibrium conditions.
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction6.png"
                alt="Solubility Prediction"
                className="property-image"
              />
              <div className="image-caption">
              image.pngOur MD Simulations accurately predicts the solubility of a typical lithium salt LiFSI in 19 solvents of diverse chemical structures and functional groups. Points close to the diagonal line indicate high prediction accuracy, giving you confidence in simulation-based screening before synthesis. 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionNew;