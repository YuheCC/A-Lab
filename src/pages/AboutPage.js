import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

// About Page component
const AboutPage = () => {

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

          <p style={{ fontStyle: 'italic', marginBottom: '5px' }}>"If it's just us, it seems like an awful waste of space."</p>
          <p style={{ fontStyle: 'italic', marginBottom: '50px' }}>Contact, 1997</p>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>What is Molecular Universe?</p>
            <p>Much like Magellan first made contact with the stars as navigation tools;</p>
            <p>Or how the Hubble Telescope made contact with galaxies far, far away;</p>
            <p>Or the Human Genome Project looked deep inside our DNA and made contact with every microscopic amino acid that defines our genetic code;</p>
            <p>SES AI has made contact with a never-before-seen 512-dimensional universe of small molecules - mapped into a 2-dimensional searchable tool - the Molecular Universe. The intent of this new map is to help battery researchers and accelerate the discovery of new materials for their next big ideas.</p>

            <p>The unique and fundamental advantages of Molecular Universe include:</p>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>The Map:</strong> A vast and constantly growing database of small molecules suitable for battery applications and their properties, both experimentally measured and computationally predicted.</li>
              <li><strong>The Navigation System:</strong> A proprietary, battery-specific LLM, carefully trained on thoroughly curated battery literature and teachings from world-class battery experts.</li>
              <li><strong>The Interface:</strong> An intuitive user interface linking the Map and Navigation System, making battery material discovery straightforward and simple.</li>
            </ol>

            <p>Currently at 10<sup>8</sup> small molecules, Molecular Universe is still in its infancy but expanding rapidly towards its target of 10<sup>11</sup> in size (in terms of actual numbers, that's 100 billion versus 100 million). The Navigation System is also undergoing consistent QA and upgrades, so it can perform as an almost living, breathing partner focused on accurately helping you find the perfect molecules for your vision.</p>
            <p>And like all AI-based technologies, with your help, we can improve Molecular Universe together, faster.</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>Why are we building Molecular Universe?</p>
            <p>There's one simple, undeniable truth: There is no such thing as the perfect, one-size-fits-all battery. Especially not with the advent of an all-electric future.</p>
            <p>That's why at SES AI, we've always sought to develop electrolytes for various practical battery chemistries including Li-Metal, high silicon Li-ion, and LFP Li-ion - for use across everything from drones to robotics, electric cars to urban air mobility, and grid storage to consumer electronics.</p>

            <p style={{ fontWeight: 'bold' }}>Battery Technology Starts with Small Molecules</p>

            <picture>
              <source srcSet="/funnel.webp" type="image/webp" />
              <img
                loading="lazy"
                src="/funnel_small.png"
                alt="Molecule Funnel"
                style={{ width: '100%', marginBottom: '20px' }}
              />
            </picture>
            
            <p>In the battery world, it all comes down to small molecules.</p>
            <p>While the universe of molecules is infinite, the universe of small molecules is not. It's measurable. In fact, we know that there are 10<sup>60</sup> possible small molecules in the universe. Of these, 10<sup>11</sup> could be used for batteries. And of those, less than 1,000 have been studied for batteries in the past 30 years.</p>
            <p>So, we have only mapped one hundred millionth of the possible database. If that's all we need, it seems like an awful waste of molecules.</p>
            <p>Do we not want to know what's out there that could double, triple, or even quadruple the cycle life of LFP Li-ion, high silicon Li-ion, Li-Metal, and more?</p>

            <p style={{ fontWeight: 'bold' }}>The Target is Set: 10<sup>11</sup> Small Molecules</p>
            <p>The mission is clear: Map the physical and chemical properties of our database of 10<sup>11</sup>.</p>
            <p>Arriving at this goal required intense computational power. Originally, we considered establishing a non-profit organization <a href="https://www.molecularuniverse.org/" target="_blank" rel="noopener noreferrer">Molecular Universe</a> to crowdsource public computing resources and eventually open-source the database. However, we found a better solution.</p>
            <p>It was far more efficient to commercially procure GPUs and collaborate with Nvidia on GPU-accelerated computation chemistry software. While we will not open-source our proprietary database, we will make Molecular Universe free to academic researchers and open-source certain aspects of our models wherever appropriate.</p>

            <p style={{ fontWeight: 'bold' }}>More About Molecular Universe, MU-0</p>
            <p>In our launch version of Molecular Universe, the Map consists of 10<sup>8</sup> molecules and their molecular properties, including both actual experimental data and computational prediction based on Density Function Theory and Molecular Dynamics simulations.</p>
            <p>This is the world's largest database of small molecule properties. And it will continue to grow to include more organic and inorganic molecules and more bulk and interphasial properties, suitable for additives, or salts, or solvents.</p>
            <p>The molecules are represented on a map through a dimension-reduction data visualization technique called UMAP (Uniform Manifold Approximation and Projection). AI sees each molecule in 512 dimensions, but for us mere mortals, UMAP reduces them to a more navigable 2 Dimensions.</p>

            <p>We invite you to join us on this journey and be part of the mission.</p>
            <p><strong>Make contact with the Molecular Universe.</strong></p>
          </div>

          <h2 id="features-section">Features of Molecular Universe</h2>

          <h3>Map</h3>

          <p>
            Visualize millions of molecules on an interactive 2D map built using UMAP (Uniform Manifold Approximation and Projection)—a machine learning algorithm that turns high-dimensional chemical structure data into an intuitive, searchable map. Each point is a molecule embedded by its structure, and clusters represent chemical families. It's like Google Maps, but for chemistry: zoom into "neighborhoods" of similar molecules and uncover hidden gems. The MU-0 map features 23 molecular clusters and counting, and is the world's largest database of small molecules and battery-related properties.
          </p>

          <h3>Ask</h3>

          <p>
            Now that you have the map, you need a navigation system. Ask is the navigation system that allows you to ask your questions in natural language. You can be general such as "recommend an electrolyte for LiFePO4 and graphite cell" or be specific such as "recommend an electrolyte that is nonflammable and stable at high voltage 4.55V and can do 6C fast charge in a Li-ion cell with NCM811 cathode and silicon anode".
          </p>

          <p>
            It answers by recommending novel approaches that can address your challenge. The answer includes relevant formulations and molecules (solvents, additives and salts). It then searches these molecules in the Map and finds molecules with similar properties. Ask links cell-level, formualtion-level and molecule-level intelligence.
          </p>

          <h3>Search</h3>

          <p>
            You can enter a "molecules-of-interest", it finds its location on the map, and recommends its "friends", which are other molecules with similar properties but might be located nearby or faraway on the map. This helps users broaden their horizon for possible molecules with similar properties. Search molecules in three powerful ways:
          </p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>By SMILES – Input a canonical SMILES string and instantly retrieve all key info.</li>
            <li style={{ color: 'black' }}>By molecule's name – input a molecule name such as "ethylene carbonate".</li>
            <li>By natural language – Ask questions like: "Find 5 molecules with LUMO above -1 eV and HOMO below -7 eV."</li>
          </ol>
          <p style={{ color: 'black' }}>
            Each result comes with a Molecule Info Card. Molecule's friends will be displayed checking the "Find Friends" <a>box</a> :
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li>Discover molecules that are structurally similar with similar properties (great for refinement),</li>
            <li>Or find structurally diverse options that still have similar properties (great for exploration).</li>
          </ul>
          <p>
            <span style={{ color: 'black' }}>The "friend" molecules will be displayed in order of similarity—based specifically on their chemical and physical properties—from most to least similar.</span> This balances exploration and exploitation—helping you expand possibilities while staying grounded in what works.
          </p>

          <h3>Filter</h3>

          <p>
            Need molecules with specific traits? Our property filters let you zero in on candidates with desirable features. All property values have been either measured in the lab or computed using traditional methods or predicted using AI/ML.
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><strong>HOMO / LUMO:</strong> These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.</li>
            <li><strong>ESP Min / Max:</strong> Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.</li>
            <li><strong>Functional Groups:</strong> Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.</li>
          </ul>
          <p>
            You can even overlay your filtered molecules directly on the UMAP to visually explore chemical regions (molecular) that meet your criteria.
          </p>

          <div id="newsfeed" className="feature-section">
            <h3>Newsfeed</h3>
            <p>April 29, 2025: Molecular Universe MU-0 is released to public</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AboutPage;