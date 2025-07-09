import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/Sidebar';

// About Page component
const AboutPage = () => {
  const { t } = useTranslation();

  // Add useEffect to set up smooth scrolling
  useEffect(() => {
    // Get the content wrapper element
    const contentWrapper = document.querySelector('.about-content-wrapper');
    if (contentWrapper) {
      // Set initial scroll position to top
      contentWrapper.scrollTop = 0;
    }
  }, []);

  return (
    <Sidebar>
      {/* Main content */}
      <div className="about-content-wrapper" style={{ width: '85%' }}>
        <div className="about-content">
          <picture>
            <source srcSet="/MakeContact.webp" type="image/webp" />
            <img
              loading="lazy"
              src="/MakeContact_small.png"
              alt="Make Contact"
              style={{ width: '100%', marginBottom: '20px' }}
            />
          </picture>

          <p style={{ fontStyle: 'italic', marginBottom: '5px' }}>"{t('about.quote')}"</p>
          <p style={{ fontStyle: 'italic', marginBottom: '50px' }}>{t('about.quoteSource')}</p>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>{t('about.whatIs.title')}</p>
            <p>{t('about.whatIs.intro1')}</p>
            <p>{t('about.whatIs.intro2')}</p>
            <p>{t('about.whatIs.intro3')}</p>
            <p>{t('about.whatIs.intro4')}</p>

            <p>{t('about.whatIs.advantages')}</p>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>{t('about.whatIs.advantage1.title')}</strong> {t('about.whatIs.advantage1.description')}</li>
              <li><strong>{t('about.whatIs.advantage2.title')}</strong> {t('about.whatIs.advantage2.description')}</li>
              <li><strong>{t('about.whatIs.advantage3.title')}</strong> {t('about.whatIs.advantage3.description')}</li>
            </ol>

            <p>{t('about.whatIs.current')}</p>
            <p>{t('about.whatIs.improvement')}</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>{t('about.whyBuilding.title')}</p>
            <p>{t('about.whyBuilding.truth')}</p>
            <p>{t('about.whyBuilding.mission')}</p>

            <p style={{ fontWeight: 'bold' }}>{t('about.whyBuilding.technologyTitle')}</p>

            <picture>
              <source srcSet="/funnel.webp" type="image/webp" />
              <img
                loading="lazy"
                src="/funnel_small.png"
                alt="Molecule Funnel"
                style={{ width: '100%', marginBottom: '20px' }}
              />
            </picture>
            
            <p>{t('about.whyBuilding.allAbout')}</p>
            <p>{t('about.whyBuilding.universe')}</p>
            <p>{t('about.whyBuilding.waste')}</p>
            <p>{t('about.whyBuilding.question')}</p>

            <p style={{ fontWeight: 'bold' }}>{t('about.whyBuilding.targetTitle')}</p>
            <p>{t('about.whyBuilding.targetMission')}</p>
            <p>{t('about.whyBuilding.computation')}</p>
            <p>{t('about.whyBuilding.solution')}</p>

            <p style={{ fontWeight: 'bold' }}>{t('about.whyBuilding.aboutMU0Title')}</p>
            <p>{t('about.whyBuilding.aboutMU0Desc')}</p>
            <p>{t('about.whyBuilding.largestDb')}</p>
            <p>{t('about.whyBuilding.umap')}</p>

            <p>{t('about.whyBuilding.invitation')}</p>
            <p><strong>{t('about.whyBuilding.makeContact')}</strong></p>
          </div>

          <h2 id="features-section">{t('about.features.title')}</h2>

          <h3>{t('about.features.map.title')}</h3>

          <p>
            {t('about.features.map.description')}
          </p>

          <h3>{t('about.features.ask.title')}</h3>

          <p>
            {t('about.features.ask.description1')}
          </p>

          <p>
            {t('about.features.ask.description2')}
          </p>

          <h3>{t('about.features.search.title')}</h3>

          <p>
            {t('about.features.search.description')}
          </p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>{t('about.features.search.way1')}</li>
            <li style={{ color: 'black' }}>{t('about.features.search.way2')}</li>
            <li>{t('about.features.search.way3')}</li>
          </ol>
          <p style={{ color: 'black' }}>
            {t('about.features.search.resultInfo')} <a>box</a> :
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li>{t('about.features.search.discover1')}</li>
            <li>{t('about.features.search.discover2')}</li>
          </ul>
          <p>
            <span style={{ color: 'black' }}>{t('about.features.search.similarity')}</span>
          </p>

          <h3>{t('about.features.filter.title')}</h3>

          <p>
            {t('about.features.filter.description')}
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><strong>HOMO / LUMO:</strong> {t('about.features.filter.homo')}</li>
            <li><strong>ESP Min / Max:</strong> {t('about.features.filter.esp')}</li>
            <li><strong>Functional Groups:</strong> {t('about.features.filter.functional')}</li>
          </ul>
          <p>
            {t('about.features.filter.overlay')}
          </p>

          <div id="newsfeed" className="feature-section">
            <h3>{t('about.newsfeed.title')}</h3>
            <p>{t('about.newsfeed.release')}</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AboutPage;