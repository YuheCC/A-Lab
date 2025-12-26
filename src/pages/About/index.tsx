import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pricing from '../../components/Pricing';
import './abou.css';
import { MessageProvider } from '@/components/MessageProvider';
import { LoginModalProvider } from '@/components/LoginModal/context';

// About Page component
const AboutPage = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add useEffect to set up smooth scrolling
  useEffect(() => {
    // Get the content wrapper element
    const contentWrapper = document.querySelector('.about-content-wrapper');
    if (contentWrapper) {
      // Set initial scroll position to top
      contentWrapper.scrollTop = 0;
    }
  }, []);

  // Cleanup effect to restore scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle feature tab click
  const handleFeatureClick = (feature: string) => {
    setActiveFeature(feature);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    // 防止背景滚动
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Handle mobile menu link click
  const handleMobileMenuClick = () => {
    setMobileMenuOpen(false);
    // 恢复页面滚动
    document.body.style.overflow = '';
  };

  const newsItems: Array<{
    key: string;
    date: string;
    title: string;
    content: string;
    href: string | null;
  }> = [
    {
      key: 'release4',
      date: t('about.newsfeed.releaseDate4'),
      title: t('about.newsfeed.release4'),
      content: t('about.newsfeed.releaseAbout4'),
      href: null,
    },
    {
      key: 'release3',
      date: t('about.newsfeed.releaseDate3'),
      title: t('about.newsfeed.release3'),
      content: t('about.newsfeed.releaseAbout3'),
      href: 'https://www.businesswire.com/news/home/20251007024181/en/SES-AI-Enhances-Leadership-of-Material-Discovery-in-Battery-Industry-with-Newest-Version-of-Molecular-Universe-and-Enterprise-Level-Subscription-Offerings',
    },
    {
      key: 'release2',
      date: t('about.newsfeed.releaseDate2'),
      title: t('about.newsfeed.release2'),
      content: t('about.newsfeed.releaseAbout2'),
      href: 'https://www.businesswire.com/news/home/20250709499100/en/SES-AI-Launches-Agentic-Capability-in-Latest-Molecular-Universe-Release-to-Increase-Value-Proposition-for-RD-as-a-Service',
    },
    {
      key: 'release1',
      date: t('about.newsfeed.releaseDate1'),
      title: t('about.newsfeed.release1'),
      content: t('about.newsfeed.releaseAbout1'),
      href: 'https://www.businesswire.com/news/home/20250429660564/en/SES-AI-Unveils-Molecular-Universe-to-the-Public-for-the-First-Time-Receives-Strong-Industry-Interest',
    },
  ];

  return (
    <div className="about-page-body">
      <header className="about-header">
        <div className="about-header-container">
            <div className="logo-container">
                <a href="https://www.ses.ai/" target="_blank">
                    <img src="logo.png" alt="SES Logo" className="logo-img" />
                </a>
            </div>
            
            {/* 桌面端导航 */}
            <nav className="about-nav desktop-nav">
                <a href="#newsfeed" className="about-nav-item">{t('about.navigation.newsfeed')}</a>
                <a href="#motivation" className="about-nav-item">{t('about.navigation.motivation')}</a>
                <a href="#features" className="about-nav-item">{t('about.navigation.features')}</a>
                <a href="#pricing" className="about-nav-item">{t('about.navigation.pricing')}</a>               
            </nav>
            
            <div className="about-header-actions">
                <a target="_blank" href="/map" className="try-mu-button">{t('about.navigation.enterMu')}</a>
            </div>
            
            {/* 移动端菜单按钮 */}
            <button 
              className="mobile-menu-button" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
        </div>
        
        {/* 移动端导航菜单 */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#newsfeed" className="mobile-nav-item" onClick={handleMobileMenuClick}>
              {t('about.navigation.newsfeed')}
            </a>
            <a href="#motivation" className="mobile-nav-item" onClick={handleMobileMenuClick}>
              {t('about.navigation.motivation')}
            </a>
            <a href="#features" className="mobile-nav-item" onClick={handleMobileMenuClick}>
              {t('about.navigation.features')}
            </a>
            <a href="#pricing" className="mobile-nav-item" onClick={handleMobileMenuClick}>
              {t('about.navigation.pricing')}
            </a>
            <a target="_blank" href="/map" className="mobile-nav-item mobile-enter-mu" onClick={handleMobileMenuClick}>
              {t('about.navigation.enterMu')}
            </a>
        </nav>
      </header>

      <main style={{paddingBottom: '100px'}}>
          <div className="about-banner-padded">
              <img src="hero-banner.png" alt="Make Contact with the Molecular Universe" className="about-banner-padded-img" />
              <a target="_blank" href="/map" className="try-mu-button banner-enter-mu-button">{t('about.navigation.enterMu')}</a>
          </div>
          <div className="about-quote" style={{textAlign:'center',margin:'32px 0 24px 0',fontSize:'1.35rem',color:'#444',fontStyle:'italic'}}>
              "{t('about.quote')}"<br/>
              <span style={{fontSize:'1rem',fontStyle:'normal'}}>{t('about.quoteSource')}</span>
          </div>
          <div className="content-sections" style={{maxWidth: '1500px'}}>
              <section id="newsfeed">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                      <h2 style={{margin: 0}}>{t('about.newsfeed.title')}</h2>
                      <a target="_blank" href="/map" style={{color: '#1c7c54', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginLeft: '20px'}}>
                          {t('about.navigation.enterMu')} ↗
                      </a>
                  </div>
                  <div className="news-feed">
                    {newsItems.map((item) => (
                      <div className="news-item" key={item.key} style={{alignItems: 'flex-start'}}>
                        <div className="news-date">{item.date}</div>
                        <div className="news-content">
                          <div className="news-title">
                            {item.title}
                          </div>
                          <p className="news-details" style={{whiteSpace: 'pre-wrap'}}>
                            {item.content}
                            {item.href && (
                              <>
                                <br />
                                <a
                                  href={item.href}
                                  target="_blank"
                                  style={{color: '#1c7c54', textDecoration: 'underline'}}
                                >
                                  {t('about.newsfeed.newsLink')}
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
              </section>
              <section id="motivation" className="prose-section">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                      <h2 style={{margin: 0}}>{t('about.navigation.motivation')}</h2>
                      <a target="_blank" href="/map" style={{color: '#1c7c54', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginLeft: '20px'}}>
                          {t('about.navigation.enterMu')} ↗
                      </a>
                  </div>
                  <h3>{t('about.whatIs.title')}</h3>
                  <p>{t('about.whatIs.intro1')}</p>
                  <p>{t('about.whatIs.intro2')}</p>
                  <p>{t('about.whatIs.intro3')}</p>
                  <p>{t('about.whatIs.intro4')}</p>
                  <p>{t('about.whatIs.advantages')}</p>
                  <div className="mu-feature-cards">
                    <div className="mu-feature-card">
                      <img src="icon-map.svg" alt="The Map" className="mu-feature-icon" />
                      <div className="mu-feature-title">{t('about.whatIs.advantage1.title')}</div>
                      <div className="mu-feature-desc">{t('about.whatIs.advantage1.description')}</div>
                    </div>
                    <div className="mu-feature-card">
                      <img src="icon-nav.svg" alt="The Navigation System" className="mu-feature-icon" />
                      <div className="mu-feature-title">{t('about.whatIs.advantage2.title')}</div>
                      <div className="mu-feature-desc">{t('about.whatIs.advantage2.description')}</div>
                    </div>
                    <div className="mu-feature-card">
                      <img src="icon-interface.svg" alt="The Interface" className="mu-feature-icon" />
                      <div className="mu-feature-title">{t('about.whatIs.advantage3.title')}</div>
                      <div className="mu-feature-desc">{t('about.whatIs.advantage3.description')}</div>
                    </div>
                  </div>
                  <p>{t('about.whatIs.current')}</p>
                  <p>{t('about.whatIs.improvement')}</p>
                  <h3>{t('about.whyBuilding.title')}</h3>
                  <p>{t('about.whyBuilding.truth')}</p>
                  <p>{t('about.whyBuilding.mission')}</p>
                  <h4>{t('about.whyBuilding.technologyTitle')}</h4>
                  <div style={{width:'100%',display:'flex',justifyContent:'center',margin:'40px 0 0 0'}}>
                    <img src="molecule-universe-stats.jpg" alt="Molecule Universe Stats" style={{maxWidth:'700px',width:'100%',height:'auto',borderRadius:'12px',boxShadow:'0 2px 16px 0 rgba(60,60,60,0.10)'}} />
                  </div>
                  <div className="mu-motivation-extended" style={{marginTop:'32px'}}>
                    <p>{t('about.whyBuilding.allAbout')}</p>
                    <p>{t('about.whyBuilding.universe')}</p>
                    <p>{t('about.whyBuilding.waste')}</p>
                    <p>{t('about.whyBuilding.question')}</p>
                    <h4 style={{marginTop:'2em'}}>{t('about.whyBuilding.targetTitle')}</h4>
                    <p>{t('about.whyBuilding.targetMission')}</p>
                    <p>{t('about.whyBuilding.computation')}</p>
                    <p>{t('about.whyBuilding.solution')}</p>
                    <p><b>{t('about.whyBuilding.makeContact')}</b></p>
                  </div>
              </section>

              <section id="features">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                      <h2 style={{margin: 0}}>{t('about.features.title')}</h2>
                      <a target="_blank" href="/map" style={{color: '#1c7c54', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginLeft: '20px'}}>
                        {t('about.navigation.enterMu')} ↗
                      </a>
                  </div>
                  <div className="features-flex">
                      <div className="features-list">
                          <div 
                            className={`feature-tab ${activeFeature === 'map' ? 'active' : ''}`} 
                            data-feature="map"
                            onClick={() => handleFeatureClick('map')}
                          >
                            {t('about.features.map.title')}
                          </div>
                          <div 
                            className={`feature-tab ${activeFeature === 'ask' ? 'active' : ''}`} 
                            data-feature="ask"
                            onClick={() => handleFeatureClick('ask')}
                          >
                            {t('about.features.ask.title')}
                          </div>
                          <div 
                            className={`feature-tab ${activeFeature === 'search' ? 'active' : ''}`} 
                            data-feature="search"
                            onClick={() => handleFeatureClick('search')}
                          >
                            {t('about.features.search.title')}
                          </div>
                          <div 
                            className={`feature-tab ${activeFeature === 'formulate' ? 'active' : ''}`} 
                            data-feature="formulate"
                            onClick={() => handleFeatureClick('formulate')}
                          >
                            {t('about.features.formulate.title')}
                          </div>
                          <div 
                            className={`feature-tab ${activeFeature === 'design' ? 'active' : ''}`} 
                            data-feature="design"
                            onClick={() => handleFeatureClick('design')}
                          >
                            {t('about.features.design.title')}
                          </div>
                          <div 
                            className={`feature-tab ${activeFeature === 'predict' ? 'active' : ''}`} 
                            data-feature="predict"
                            onClick={() => handleFeatureClick('predict')}
                          >
                            {t('about.features.predict.title')}
                          </div>
                      </div>
                      <div className="features-content">
                          <div className="feature-detail" data-feature="map" style={{display: activeFeature === 'map' ? 'block' : 'none'}}>
                              <h3>{t('about.features.map.title')}</h3>
                              <p>{t('about.features.map.description')}</p>
                          </div>
                          <div className="feature-detail" data-feature="ask" style={{display: activeFeature === 'ask' ? 'block' : 'none'}}>
                              <h3>{t('about.features.ask.title')}</h3>
                              <p>{t('about.features.ask.description')}</p>
                              {/* <p>{t('about.features.ask.description2')}</p> */}
                          </div>
                          <div className="feature-detail" data-feature="search" style={{display: activeFeature === 'search' ? 'block' : 'none'}}>
                              <h3>{t('about.features.search.title')}</h3>
                              <p>{t('about.features.search.description')}</p>
                              {/* <ul>
                                  <li><b>{t('about.features.search.way1')}</b></li>
                                  <li><b>{t('about.features.search.way2')}</b></li>
                                  <li><b>{t('about.features.search.way3')}</b></li>
                                  <li><b>{t('about.features.search.way4')}</b></li>
                              </ul>
                              <p>{t('about.features.search.resultInfo')}</p>
                              <ul>
                                  <li>{t('about.features.search.discover1')}</li>
                                  <li>{t('about.features.search.discover2')}</li>
                              </ul>
                              <p>{t('about.features.search.similarity')}</p> */}
                          </div>
                          <div className="feature-detail" data-feature="formulate" style={{display: activeFeature === 'formulate' ? 'block' : 'none'}}>
                              <h3>{t('about.features.formulate.title')}</h3>
                              <p>{t('about.features.formulate.description')}</p>
                          </div>
                          <div className="feature-detail" data-feature="design" style={{display: activeFeature === 'design' ? 'block' : 'none'}}>
                              <h3>{t('about.features.design.title')}</h3>
                              <p>{t('about.features.design.description')}</p>
                          </div>
                          <div className="feature-detail" data-feature="predict" style={{display: activeFeature === 'predict' ? 'block' : 'none'}}>
                              <h3>{t('about.features.predict.title')}</h3>
                              <p>{t('about.features.predict.description')}</p>
                          </div>
                      </div>
                  </div>
              </section>
              <Pricing />
          </div>
      </main>

      {/* <footer className="site-footer">
          <div className="footer-main">
              <div className="footer-logo-col">
                  <img src="logo.png" alt="SES Logo" className="footer-logo" />
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">{t('about.footer.products')}</div>
                  <ul className="footer-list">
                      <li><a href="#">{t('about.footer.productList.ev')}</a></li>
                      <li><a href="#">{t('about.footer.productList.uam')}</a></li>
                      <li><a href="#">{t('about.footer.productList.drone')}</a></li>
                      <li><a href="#">{t('about.footer.productList.molecularUniverse')}</a></li>
                      <li><a href="#">{t('about.footer.productList.avatar')}</a></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">{t('about.footer.technology')}</div>
                  <ul className="footer-list">
                      <li><a href="#">{t('about.footer.technologyList.liMetal')}</a></li>
                      <li><a href="#">{t('about.footer.technologyList.insights')}</a></li>
                      <li><a href="#">{t('about.footer.technologyList.batteryWorld')}</a></li>
                      <li><a href="#">{t('about.footer.technologyList.demoDay')}</a></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">{t('about.footer.company')}</div>
                  <ul className="footer-list">
                      <li><a href="#">{t('about.footer.companyList.aboutUs')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.ourTeam')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.media')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.careers')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.investors')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.sustainability')}</a></li>
                      <li><a href="#">{t('about.footer.companyList.contactUs')}</a></li>
                  </ul>
              </div>
          </div>
          <div className="footer-bottom">
              <div className="footer-copyright">{t('about.footer.copyright')}</div>
              <a href="#" className="footer-policy">{t('about.footer.privacyPolicy')}</a>
          </div>
      </footer> */}
    </div>
  );
};

const AboutPageWithProvider = () => {
  return (
    <LoginModalProvider>
      <MessageProvider>
        <AboutPage />
      </MessageProvider>
    </LoginModalProvider>
  );
};

export default AboutPageWithProvider;
