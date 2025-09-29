import React from 'react';
import { useTranslation } from 'react-i18next';
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
          Molecular dynamics (MD) simulations in MU's platform uniquely combine advanced polarizable force fields with an automated workflow,
          capturing ion–solvent interactions with high fidelity. Users simply submit electrolyte formulations through the MU portal, and within days
          receive quantitative predictions of key properties—delivering faster, more reliable insights than conventional trial-and-error or standard
          modeling approaches.
        </p>

        {/* MD Service Workflow Image */}
        <div className="content-image-section">
          <img
            src="/formulation/introduction1.png"
            alt="MD simulation workflow"
            className="content-image"
          />
          <div className="image-caption">
            Our proprietary Molecular Dynamics (MD) service for electrolyte formulation
          </div>
        </div>
      </div>

      {/* MD Service Benefits Section */}
      <div className="content-section">
        <div className="content-layout">
          <div className="content-text" style={{ paddingTop: '25px' }}>
            <p className="content-description">
              MU's proprietary MD service provides molecular-level snapshots of electrolyte formulations, capturing how Li⁺, anions, and solvents
              organize at different salt concentrations.
            </p>
            <p className="content-description">
              Each simulation run completes in ~3 days, after which customers receive quantitative property predictions—delivering
              fast, reliable insights to guide electrolyte design and optimization beyond traditional trial-and-error approaches.
            </p>
          </div>
          <div className="content-image-section">
            <img
              src="/formulation/introduction2.png"
              alt="MD simulation across concentrations"
              className="content-image"
            />
            <div className="image-caption">
              Accelerating electrolyte design with MD simulations across concentrations
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
            The properties listed as Group 1 will be available in 3 days as soon as the MD simulations are complete. For other properties, please contact our team.
          </p>
          <button className="contact-team-button">
            Contact Team
          </button>
        </div>
      </div>

      {/* Group 1: Standard Properties */}
      <div className="content-section">
        <div className="group-header">
          <span className="group-label">GROUP 01</span>
          <h2 className="section-title group-title">Standard Properties</h2>
        </div>

        {/* Property 01: RDF */}
        <div className="property-item">
          <div className="property-number">01</div>
          <h3 className="property-title">Radial distribution function (RDF)</h3>
          <p className="property-description">
            Probability of finding a particle at a given distance from a reference particle, describing local structure.
            This has impacts on solubility, conductivity, dissolution at electrolyte-electrode interphase, and SEI.
          </p>
        </div>

        {/* Property 02: CN */}
        <div className="property-item">
          <div className="property-number">02</div>
          <h3 className="property-title">Coordination number (CN)</h3>
          <p className="property-description">
            Average number of neighboring atoms/ions surrounding a central particle.
          </p>
        </div>

        {/* Property 03: Solvation cluster analysis */}
        <div className="property-item property-item-cluster">
          <div className="property-number">03</div>
          <h3 className="property-title">Solvation cluster analysis</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Analyzes how cations and anions associate in electrolyte solutions through three key configurations:
            </p>

            {/* SSIP */}
            <div className="cluster-type">
              <div className="cluster-badge">SSIP</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Solvent-Separated Ion Pair</h4>
                <p className="cluster-desc">
                  Cation-anion correlated but at least one solvent molecule sits between. Favored in high-dielectric solvents;
                  supports higher Li⁺ mobility.
                </p>
              </div>
            </div>

            {/* CIP */}
            <div className="cluster-type">
              <div className="cluster-badge">CIP</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Contact Ion Pair</h4>
                <p className="cluster-desc">
                  Cation-anion directly contact, no solvent in between. More common at higher salt concentration;
                  can slow down ion transport.
                </p>
              </div>
            </div>

            {/* AGG */}
            <div className="cluster-type">
              <div className="cluster-badge">AGG</div>
              <div className="cluster-details">
                <h4 className="cluster-name">Aggregate</h4>
                <p className="cluster-desc">
                  Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes;
                  often reduces conductivity.
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
              The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to ionic conductivity, viscosity, and Li⁺ transport behavior.
            </p>
          </div>
        </div>

        {/* Property 04: Diffusivity */}
        <div className="property-item">
          <div className="property-number">04</div>
          <h3 className="property-title">Diffusivity</h3>
          <p className="property-description">
            Rate of particle spreading due to random motion, linked to mobility.
          </p>
        </div>

        {/* Property 05: Conductivity */}
        <div className="property-item property-item-with-image">
          <div className="property-number">05</div>
          <h3 className="property-title">Conductivity</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              Ability of ions/electrons to carry charge through a medium. As shown in the figure below, our MD-calculated ionic conductivity aligns well with experimental benchmarks, providing reliable predictions for electrolyte design.
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction4.png"
                alt="MD Simulation Accuracy"
                className="property-image"
              />
              <div className="image-caption">MD Simulation Accuracy: Predicted vs. Measured Ionic Conductivity</div>
              <p className="image-description">
                Our molecular dynamics simulations demonstrate excellent agreement with experimental ionic conductivity measurements across over 100 electrolyte formulation systems (0-40 mS/cm). Points close to the diagonal line indicate high prediction accuracy, giving you confidence in simulation-based screening before synthesis.
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
          <span className="group-label">GROUP 02</span>
          <h2 className="section-title group-title">Instructions Needed</h2>
        </div>

        {/* Property 08: Ion–ion correlation */}
        <div className="property-item">
          <div className="property-number">08</div>
          <h3 className="property-title">Ion–ion correlation</h3>
          <p className="property-description">
            Measure of how ionic positions and motions are correlated beyond random distribution.
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
          <span className="group-label">GROUP 03</span>
          <h2 className="section-title group-title">Advanced Properties</h2>
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
                Electric double layer under well-controlled electrostatic potential. In this MD simulation, electrolyte is created between two electrodes. By mimicking the potential change across the quasi cell, surface structure under electrostatic potential can be studied.
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
              Maximum amount of a substance that can dissolve in a solvent under equilibrium conditions.
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction6.png"
                alt="Solubility Prediction"
                className="property-image"
              />
              <div className="image-caption">
                Our MD Simulations Accurately Predict solubility of LiFSI in 19 solvents. Points close to the diagonal line indicate high prediction accuracy, giving you confidence in simulation-based screening before synthesis.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionNew;