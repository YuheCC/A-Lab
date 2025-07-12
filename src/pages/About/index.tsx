import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './abou.css';

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
    <div className="about-page-body">
      <header className="about-header">
        <div className="about-header-container">
            <div className="logo-container">
                <a href="https://www.ses.ai/" target="_blank">
                    <img src="logo.png" alt="SES Logo" className="logo-img" />
                </a>
            </div>
            <nav className="about-nav">
                <a href="#motivation" className="about-nav-item">Motivation</a>
                <a href="#features" className="about-nav-item">Features</a>
                <a href="#pricing" className="about-nav-item">Pricing</a>
                <a href="#newsfeed" className="about-nav-item">News Feed</a>
            </nav>
            <div className="about-header-actions">
                <a href="login.html" className="try-mu-button">Enter MU</a>
            </div>
        </div>
      </header>

      <main>
          <div className="about-banner-padded">
              <img src="hero-banner.png" alt="Make Contact with the Molecular Universe" className="about-banner-padded-img" />
              <a href="login.html" className="try-mu-button banner-enter-mu-button">Enter MU</a>
          </div>
          <div className="about-quote" style={{textAlign:'center',margin:'32px 0 24px 0',fontSize:'1.35rem',color:'#444',fontStyle:'italic'}}>
              "If it's just us, it seems like an awful waste of space."<br/>
              <span style={{fontSize:'1rem',fontStyle:'normal'}}>Contact, 1997</span>
          </div>
          <div className="content-sections">
              <section id="motivation" className="prose-section">
                  <h2>Motivation</h2>
                  <h3>What is Molecular Universe?</h3>
                  <p>Much like Magellan first made contact with the stars as navigation tools;</p>
                  <p>Or how the Hubble Telescope made contact with galaxies far, far away;</p>
                  <p>Or the Human Genome Project looked deep inside our DNA and made contact with every microscopic amino acid that defines our genetic code;</p>
                  <p>SES AI has made contact with a never-before-seen 512-dimensional universe of small molecules - mapped into a 2-dimensional searchable tool - the Molecular Universe. The intent of this new map is to help battery researchers and accelerate the discovery of new materials for their next big ideas.</p>
                  <p>The unique and fundamental advantages of Molecular Universe include:</p>
                  <div className="mu-feature-cards">
                    <div className="mu-feature-card">
                      <img src="icon-map.svg" alt="The Map" className="mu-feature-icon" />
                      <div className="mu-feature-title">The Map</div>
                      <div className="mu-feature-desc">A vast and constantly growing database of small molecules suitable for battery applications and their properties, both experimentally measured and computationally predicted.</div>
                    </div>
                    <div className="mu-feature-card">
                      <img src="icon-nav.svg" alt="The Navigation System" className="mu-feature-icon" />
                      <div className="mu-feature-title">The Navigation System</div>
                      <div className="mu-feature-desc">A proprietary, battery-specific LLM, carefully trained on thoroughly curated battery literature and teachings from world-class battery experts.</div>
                    </div>
                    <div className="mu-feature-card">
                      <img src="icon-interface.svg" alt="The Interface" className="mu-feature-icon" />
                      <div className="mu-feature-title">The Interface</div>
                      <div className="mu-feature-desc">An intuitive user interface linking the Map and Navigation System, making battery material discovery straightforward and simple.</div>
                    </div>
                  </div>
                  <p>Currently at 10<sup>8</sup> small molecules, Molecular Universe is still in its infancy but expanding rapidly towards its target of 10<sup>11</sup> in size (in terms of actual numbers, that's 100 billion versus 100 million). The Navigation System is also undergoing consistent QA and upgrades, so it can perform as an almost living, breathing partner focused on accurately helping you find the perfect molecules for your vision.</p>
                  <p>And like all AI-based technologies, with your help, we can improve Molecular Universe together, faster.</p>
                  <h3>Why are we building Molecular Universe?</h3>
                  <p>There's one simple, undeniable truth: There is no such thing as the perfect, one-size-fits-all battery. Especially not with the advent of an all-electric future.</p>
                  <p>That's why at SES AI, we've always sought to develop electrolytes for various practical battery chemistries including Li-Metal, high silicon Li-ion, and LFP Li-ion - for use across everything from drones to robotics, electric cars to urban air mobility, and grid storage to consumer electronics.</p>
                  <h4>Battery Technology Starts with Small Molecules</h4>
                  <div style={{width:'100%',display:'flex',justifyContent:'center',margin:'40px 0 0 0'}}>
                    <img src="molecule-universe-stats.jpg" alt="Molecule Universe Stats" style={{maxWidth:'700px',width:'100%',height:'auto',borderRadius:'12px',boxShadow:'0 2px 16px 0 rgba(60,60,60,0.10)'}} />
                  </div>
                  <div className="mu-motivation-extended" style={{marginTop:'32px'}}>
                    <p>In the battery world, it all comes down to small molecules.</p>
                    <p>While the universe of molecules is infinite, the universe of small molecules is not. It's measurable. In fact, we know that there are 10<sup>60</sup> possible small molecules in the universe. Of these, 10<sup>11</sup> could be used for batteries. And of those, less than 1,000 have been studied for batteries in the past 30 years.</p>
                    <p>So, we have only mapped one hundred millionth of the possible database. If that's all we need, it seems like an awful waste of molecules.</p>
                    <p>Do we not want to know what's out there that could double, triple, or even quadruple the cycle life of LFP Li-ion, high silicon Li-ion, Li-Metal, and more?</p>
                    <h4 style={{marginTop:'2em'}}>The Target is Set: 10<sup>11</sup> Small Molecules</h4>
                    <p>The mission is clear: Map the physical and chemical properties of our database of 10<sup>11</sup>.</p>
                    <p>Arriving at this goal required intense computational power. Originally, we considered establishing a non-profit organization Molecular Universe to crowdsource public computing resources and eventually open-source the database. However, we found a better solution.</p>
                    <p>It was far more efficient to commercially procure GPUs and collaborate with Nvidia on GPU-accelerated computation chemistry software. While we will not open-source our proprietary database, we will make Molecular Universe free to academic researchers and open-source certain aspects of our models wherever appropriate.</p>
                    <h4 style={{marginTop:'2em'}}>More About Molecular Universe, MU-0</h4>
                    <p>In our launch version of Molecular Universe, the Map consists of 10<sup>8</sup> molecules and their molecular properties, including both actual experimental data and computational prediction based on Density Function Theory and Molecular Dynamics simulations.</p>
                    <p>This is the world's largest database of small molecule properties. And it will continue to grow to include more organic and inorganic molecules and more bulk and interphasial properties, suitable for additives, or salts, or solvents.</p>
                    <p>The molecules are represented on a map through a dimension-reduction data visualization technique called UMAP (Uniform Manifold Approximation and Projection). AI sees each molecule in 512 dimensions, but for us mere mortals, UMAP reduces them to a more navigable 2 Dimensions.</p>
                    <p>We invite you to join us on this journey and be part of the mission.</p>
                    <p><b>Make contact with the Molecular Universe.</b></p>
                  </div>
              </section>

              <section id="features">
                  <h2>Features</h2>
                  <div className="features-flex">
                      <div className="features-list">
                          <div className="feature-tab active" data-feature="map">Map</div>
                          <div className="feature-tab" data-feature="ask">Ask</div>
                          <div className="feature-tab" data-feature="search">Search</div>
                          <div className="feature-tab" data-feature="filter">Filter</div>
                      </div>
                      <div className="features-content">
                          <div className="feature-detail" data-feature="map">
                              <h3>Map</h3>
                              <p>Visualize millions of molecules on an interactive 2D map built using UMAP (Uniform Manifold Approximation and Projection)—a machine learning algorithm that turns high-dimensional chemical structure data into an intuitive, searchable map. Each point is a molecule embedded by its structure, and clusters represent chemical families. It's like Google Maps, but for chemistry: zoom into "neighborhoods" of similar molecules and uncover hidden gems. The MU-0 map features 23 molecular clusters and counting, and is the world's largest database of small molecules and battery-related properties.</p>
                          </div>
                          <div className="feature-detail" data-feature="ask" style={{display:'none'}}>
                              <h3>Ask</h3>
                              <p>Now that you have the map, you need a navigation system. Ask is the navigation system that allows you to ask your questions in natural language. You can be general such as "recommend an electrolyte for LiFePO4 and graphite cell" or be specific such as "recommend an electrolyte that is nonflammable and stable at high voltage 4.55V and can do 6C fast charge in a Li-ion cell with NCM811 cathode and silicon anode".</p>
                              <p>It answers by recommending novel approaches that can address your challenge. The answer includes relevant formulations and molecules (solvents, additives and salts). It then searches these molecules in the Map and finds molecules with similar properties. Ask links cell-level, formualtion-level and molecule-level intelligence.</p>
                          </div>
                          <div className="feature-detail" data-feature="search" style={{display:'none'}}>
                              <h3>Search</h3>
                              <p>You can enter a "molecules-of-interest", it finds its location on the map, and recommends its "friends", which are other molecules with similar properties but might be located nearby or faraway on the map. This helps users broaden their horizon for possible molecules with similar properties. Search molecules in three powerful ways:</p>
                              <ul>
                                  <li><b>By SMILES</b> – Input a canonical SMILES string and instantly retrieve all key info.</li>
                                  <li><b>By molecule's name</b> – input a molecule name such as "ethylene carbonate".</li>
                                  <li><b>By natural language</b> – Ask questions like: "Find 5 molecules with LUMO above -1 eV and HOMO below -7 eV."</li>
                              </ul>
                              <p>Each result comes with a Molecule Info Card. Molecule's friends will be displayed checking the "Find Friends" box :</p>
                              <ul>
                                  <li>Discover molecules that are structurally similar with similar properties (great for refinement),</li>
                                  <li>Or find structurally diverse options that still have similar properties (great for exploration).</li>
                              </ul>
                              <p>The "friend" molecules will be displayed in order of similarity—based specifically on their chemical and physical properties—from most to least similar. This balances exploration and exploitation—helping you expand possibilities while staying grounded in what works.</p>
                          </div>
                          <div className="feature-detail" data-feature="filter" style={{display:'none'}}>
                              <h3>Filter</h3>
                              <p>Need molecules with specific traits? Our property filters let you zero in on candidates with desirable features. All property values have been either measured in the lab or computed using traditional methods or predicted using AI/ML.</p>
                              <ul>
                                  <li><b>HOMO / LUMO:</b> These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.</li>
                                  <li><b>ESP Min / Max:</b> Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.</li>
                                  <li><b>Functional Groups:</b> Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.</li>
                              </ul>
                              <p>You can even overlay your filtered molecules directly on the UMAP to visually explore chemical regions (molecular) that meet your criteria.</p>
                          </div>
                      </div>
                  </div>
              </section>
              <section id="pricing">
                  <h2>Pricing</h2>
                  <div className="pricing-switcher" style={{display:'flex',justifyContent:'center',gap:'24px',marginBottom:'32px'}}>
                    <button className="pricing-switch-btn active" data-group="personal">Personal</button>
                    <button className="pricing-switch-btn" data-group="business">Business</button>
                  </div>
                  <div className="pricing-group" data-group="personal">
                    <div className="pricing-grid">
                      <div className="pricing-card">
                          <div className="pricing-card-top">
                          <div className="pricing-title">Research <span className="pricing-sub">(academia only)</span></div>
                          <div className="pricing-access">Access to Partial Molecular Universe (1M)</div>
                          <div className="pricing-price">$0<span className="pricing-unit">/month</span></div>
                          </div>
                          <button className="pricing-btn">Get Started</button>
                          <ul className="pricing-features">
                              <li>Map</li>
                              <li>Filter</li>
                              <li>Search</li>
                              <li>Ask (≤ 100 queries/month)</li>
                          </ul>
                      </div>
                      <div className="pricing-card highlight">
                          <div className="pricing-card-top">
                          <div className="pricing-title">Explorer</div>
                          <div className="pricing-access">Access to Partial Molecular Universe (1M)</div>
                          <div className="pricing-price">$150<span className="pricing-unit">/month</span></div>
                          </div>
                          <button className="pricing-btn" style={{background:'#1c7c54'}}>Get Explorer</button>
                          <ul className="pricing-features">
                              <li>Map</li>
                              <li>Filter</li>
                              <li>Search</li>
                              <li>Ask (no cap)</li>
                          </ul>
                      </div>
                      <div className="pricing-card">
                          <div className="pricing-card-top">
                          <div className="pricing-title">Team</div>
                          <div className="pricing-access">Access to Partial Molecular Universe (1M)</div>
                          <div className="pricing-price">$1,000<span className="pricing-unit">/month</span></div>
                          <div className="pricing-note">Up to 10 users</div>
                          </div>
                          <button className="pricing-btn">Get Team</button>
                          <ul className="pricing-features">
                              <li>Map</li>
                              <li>Filter</li>
                              <li>Search</li>
                              <li>Ask (no cap)</li>
                          </ul>
                      </div>
                    </div>
                  </div>
                  <div className="pricing-group" data-group="business" style={{display:'none'}}>
                    <div className="pricing-grid">
                      <div className="pricing-card">
                          <div className="pricing-card-top">
                          <div className="pricing-title">Enterprise</div>
                          <div className="pricing-access">Access to Whole Molecular Universe (100M)</div>
                          </div>
                          <button className="pricing-btn secondary">Contact Sales</button>
                          <ul className="pricing-features">
                              <li>Map</li>
                              <li>Filter</li>
                              <li>Search</li>
                              <li>Ask (no cap, battery-specific LLM)</li>
                              <li>More molecule properties (inc. melting and boiling point predictions)</li>
                              <li>Expert consulting</li>
                          </ul>
                      </div>
                      <div className="pricing-card">
                          <div className="pricing-card-top">
                          <div className="pricing-title">Joint Development</div>
                          <div className="pricing-access">Access to Whole Molecular Universe (100M)</div>
                          </div>
                          <button className="pricing-btn secondary">Contact Sales</button>
                          <ul className="pricing-features">
                              <li>Map</li>
                              <li>Filter</li>
                              <li>Search</li>
                              <li>Ask (no cap, battery-specific LLM)</li>
                              <li>More molecule properties (inc. melting and boiling point predictions)</li>
                              <li>Customized statement-of-work (inc. molecule synthesis, electrolyte formulation development and cell validation)</li>
                          </ul>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign: 'center', marginTop: '32px', fontSize: '1.1rem', color: '#666', fontStyle: 'italic'}}>
                      Molecular Universe is free for students and educators. <span style={{textDecoration: 'underline'}}>Get Verified</span>
                  </div>
              </section>
              <section id="newsfeed">
                  <h2>News Feed</h2>
                  <div className="news-feed">
                      <div className="news-item">
                          <div className="news-date">April 29, 2025</div>
                          <div className="news-content">Molecular Universe MU-0 is released to public</div>
                      </div>
                  </div>
              </section>
          </div>
      </main>

      <footer className="site-footer">
          <div className="footer-main">
              <div className="footer-logo-col">
                  <img src="logo.png" alt="SES Logo" className="footer-logo" />
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">Our products</div>
                  <ul className="footer-list">
                      <li><a href="#">EV</a></li>
                      <li><a href="#">UAM</a></li>
                      <li><a href="#">Drone</a></li>
                      <li><a href="#">Molecular Universe</a></li>
                      <li><a href="#">Avatar</a></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">Technology</div>
                  <ul className="footer-list">
                      <li><a href="#">Li-Metal</a></li>
                      <li><a href="#">Insights</a></li>
                      <li><a href="#">Battery world</a></li>
                      <li><a href="#">Demo Day</a></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <div className="footer-col-title">Company</div>
                  <ul className="footer-list">
                      <li><a href="#">About Us</a></li>
                      <li><a href="#">Our Team</a></li>
                      <li><a href="#">Media</a></li>
                      <li><a href="#">Careers</a></li>
                      <li><a href="#">Investors</a></li>
                      <li><a href="#">Sustainability</a></li>
                      <li><a href="#">Contact Us</a></li>
                  </ul>
              </div>
          </div>
          <div className="footer-bottom">
              <div className="footer-copyright">Copyright © 2025 SES AI Corporation. All rights reserved.</div>
              <a href="#" className="footer-policy">Privacy Policy</a>
          </div>
      </footer>
    </div>
  );
};

export default AboutPage;