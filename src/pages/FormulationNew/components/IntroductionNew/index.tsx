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
        <h2 className="section-title">{t('formulation.introductionNew.functionIntroTitle')}</h2>
        <p className="section-description">
          {t('formulation.introductionNew.functionIntroDescription')}
        </p>

        {/* MD Service Workflow Image */}
        <div className="content-image-section">
          <img
            src="/formulation/introduction1.png"
            alt={t('formulation.introductionNew.functionIntroImageAlt')}
            className="content-image"
          />
          <div className="image-caption">
            {t('formulation.introductionNew.functionIntroCaption')}
          </div>
        </div>
      </div>

      {/* MD Service Benefits Section */}
      <div className="content-section">
        <div className="content-layout">
          <div className="content-text" style={{ paddingTop: '45px' }}>
            <p className="content-description">
              {t('formulation.introductionNew.benefitsParagraph1')}
            </p>
            <p className="content-description">
              {t('formulation.introductionNew.benefitsParagraph2')}
            </p>
          </div>
          <div className="content-image-section">
            <img
              src="/formulation/introduction2.png"
              alt={t('formulation.introductionNew.benefitsImageAlt')}
              className="content-image"
            />
            <div className="image-caption">
              {t('formulation.introductionNew.benefitsImageCaption')}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Introduction Section */}
      <div className="content-section">
        <h2 className="section-title">{t('formulation.introductionNew.propertiesIntroTitle')}</h2>
        <div className="properties-table-container">
          <PropertiesTable />
        </div>
        <div className="properties-note">
          <p className="note-text">
            <Info size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
            <span>{t('formulation.introductionNew.propertiesIntroNoteDescription')}</span>
          </p>
          <button 
            className="contact-team-button"
            onClick={() => window.open('mailto:md-service@ses.ai')}
          >
            {t('formulation.introductionNew.propertiesIntroNoteButton')}
          </button>
        </div>
      </div>

      {/* Group 1: Standard Properties */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">{t('formulation.introductionNew.groupStandardProperties')}</h2>
        </div>

        {/* Property 01: RDF */}
        <div className="property-item">
          <div className="property-number">01</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardRdfTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.standardRdfDescription')}
          </p>
        </div>

        {/* Property 02: CN */}
        <div className="property-item">
          <div className="property-number">02</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardCnTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.standardCnDescription')}
          </p>
        </div>

        {/* Property 03: Solvation cluster analysis */}
        <div className="property-item property-item-cluster">
          <div className="property-number">03</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardSolvationClusterTitle')}</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              {t('formulation.introductionNew.standardSolvationClusterDescription')}
            </p>

            {/* SSIP */}
            <div className="cluster-type">
              <div className="cluster-badge">{t('formulation.introductionNew.standardSolvationClusterSsipBadge')}</div>
              <div className="cluster-details">
                <h4 className="cluster-name">{t('formulation.introductionNew.standardSolvationClusterSsipName')}</h4>
                <p className="cluster-desc">
                  {t('formulation.introductionNew.standardSolvationClusterSsipDescription')}
                </p>
              </div>
            </div>

            {/* CIP */}
            <div className="cluster-type">
              <div className="cluster-badge">{t('formulation.introductionNew.standardSolvationClusterCipBadge')}</div>
              <div className="cluster-details">
                <h4 className="cluster-name">{t('formulation.introductionNew.standardSolvationClusterCipName')}</h4>
                <p className="cluster-desc">
                  {t('formulation.introductionNew.standardSolvationClusterCipDescription')}
                </p>
              </div>
            </div>

            {/* AGG */}
            <div className="cluster-type">
              <div className="cluster-badge">{t('formulation.introductionNew.standardSolvationClusterAggBadge')}</div>
              <div className="cluster-details">
                <h4 className="cluster-name">{t('formulation.introductionNew.standardSolvationClusterAggName')}</h4>
                <p className="cluster-desc">
                  {t('formulation.introductionNew.standardSolvationClusterAggDescription')}
                </p>
              </div>
            </div>

            {/* Cluster Illustration */}
            <div className="cluster-illustration">
              <img
                src="/formulation/cluster-illustration.jpg"
                alt={t('formulation.introductionNew.standardSolvationClusterImageAlt')}
                className="cluster-image"
              />
              <div className="image-caption">{t('formulation.introductionNew.standardSolvationClusterImageCaption')}</div>
            </div>

            <p className="cluster-summary">
              {t('formulation.introductionNew.standardSolvationClusterSummary')}
            </p>
          </div>
        </div>

        {/* Property 04: Diffusivity */}
        <div className="property-item">
          <div className="property-number">04</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardDiffusivityTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.standardDiffusivityDescription')}
          </p>
        </div>

        {/* Property 05: Conductivity */}
        <div className="property-item property-item-with-image">
          <div className="property-number">05</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardConductivityTitle')}</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              {t('formulation.introductionNew.standardConductivityDescription')}
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction4.png"
                alt={t('formulation.introductionNew.standardConductivityImageAlt')}
                className="property-image"
              />
              <div className="image-caption">{t('formulation.introductionNew.standardConductivityImageCaption')}</div>
              <p className="image-description">
                {t('formulation.introductionNew.standardConductivityImageDescription1')}
              </p>
              <p className="image-description">
                {t('formulation.introductionNew.standardConductivityImageDescription2')}
              </p>
              <p className="image-description">
                {t('formulation.introductionNew.standardConductivityImageDescription3')}
              </p>
            </div>
          </div>
        </div>

        {/* Property 06: Viscosity */}
        <div className="property-item">
          <div className="property-number">06</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardViscosityTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.standardViscosityDescription')}
          </p>
        </div>

        {/* Property 07: Density */}
        <div className="property-item">
          <div className="property-number">07</div>
          <h3 className="property-title">{t('formulation.introductionNew.standardDensityTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.standardDensityDescription')}
          </p>
        </div>
      </div>

      {/* Group 2: Instructions Needed */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">{t('formulation.introductionNew.groupAdvancedAnalysis')}</h2>
        </div>

        {/* Property 08: Ion–ion correlation */}
        <div className="property-item">
          <div className="property-number">08</div>
          <h3 className="property-title">{t('formulation.introductionNew.advancedIonCorrelationTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.advancedIonCorrelationDescription')}
          </p>
        </div>

        {/* Property 09: Structure factor */}
        <div className="property-item">
          <div className="property-number">09</div>
          <h3 className="property-title">{t('formulation.introductionNew.advancedStructureFactorTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.advancedStructureFactorDescription')}
          </p>
        </div>

        {/* Property 10: Dynamic structure factor */}
        <div className="property-item">
          <div className="property-number">10</div>
          <h3 className="property-title">{t('formulation.introductionNew.advancedDynamicStructureFactorTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.advancedDynamicStructureFactorDescription')}
          </p>
        </div>

        {/* Property 11: Residence time */}
        <div className="property-item">
          <div className="property-number">11</div>
          <h3 className="property-title">{t('formulation.introductionNew.advancedResidenceTimeTitle')}</h3>
          <p className="property-description">
            {t('formulation.introductionNew.advancedResidenceTimeDescription')}
          </p>
        </div>
      </div>

      {/* Group 3: Advanced Properties */}
      <div className="content-section">
        <div className="group-header">
          <h2 className="section-title group-title">{t('formulation.introductionNew.groupCustomStudies')}</h2>
        </div>

        {/* Property 12: EDL */}
        <div className="property-item property-item-with-image">
          <div className="property-number">12</div>
          <h3 className="property-title">{t('formulation.introductionNew.customEdlTitle')}</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              {t('formulation.introductionNew.customEdlDescription')}
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction5.png"
                alt={t('formulation.introductionNew.customEdlImageAlt')}
                className="property-image"
              />
              <div className="image-caption">
                {t('formulation.introductionNew.customEdlImageCaption')}
              </div>
            </div>
          </div>
        </div>

        {/* Property 13: Solubility */}
        <div className="property-item property-item-with-image">
          <div className="property-number">13</div>
          <h3 className="property-title">{t('formulation.introductionNew.customSolubilityTitle')}</h3>
          <div className="property-description-wrapper">
            <p className="property-description">
              {t('formulation.introductionNew.customSolubilityDescription')}
            </p>

            <div className="property-image-section">
              <img
                src="/formulation/introduction6.png"
                alt={t('formulation.introductionNew.customSolubilityImageAlt')}
                className="property-image"
              />
              <div className="image-caption">
                {t('formulation.introductionNew.customSolubilityImageCaption')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionNew;