export default {
  // Header navigation
  navigation: {
    motivation: "Motivation",
    features: "Features", 
    pricing: "Pricing",
    newsfeed: "News Feed",
    enterMu: "Enter MU"
  },

  quote: "If it's just us, it seems like an awful waste of space.",
  quoteSource: "Contact, 1997",
  
  whatIs: {
    title: "What is Molecular Universe?",
    intro1: "Much like Magellan first made contact with the stars as navigation tools;",
    intro2: "Or how the Hubble Telescope made contact with galaxies far, far away;",
    intro3: "Or the Human Genome Project looked deep inside our DNA and made contact with every microscopic amino acid that defines our genetic code;",
    intro4: "SES AI has made contact with a never-before-seen 512-dimensional universe of small molecules - mapped into a 2-dimensional searchable tool - the Molecular Universe. The intent of this new map is to help battery researchers and accelerate the discovery of new materials for their next big ideas.",
    
    advantages: "The unique and fundamental advantages of Molecular Universe include:",
    advantage1: {
      title: "The Map",
      description: "A vast and constantly growing database of small molecules suitable for battery applications and their properties, both experimentally measured and computationally predicted."
    },
    advantage2: {
      title: "The Navigation System",
      description: "A proprietary, battery-specific LLM, carefully trained on thoroughly curated battery literature and teachings from world-class battery experts."
    },
    advantage3: {
      title: "The Interface",
      description: "An intuitive user interface linking the Map and Navigation System, making battery material discovery straightforward and simple."
    },
    
    current: "Currently at 10⁸ small molecules, Molecular Universe is still in its infancy but expanding rapidly towards its target of 10¹¹ in size (in terms of actual numbers, that's 100 billion versus 100 million). The Navigation System is also undergoing consistent QA and upgrades, so it can perform as an almost living, breathing partner focused on accurately helping you find the perfect molecules for your vision.",
    improvement: "And like all AI-based technologies, with your help, we can improve Molecular Universe together, faster."
  },
  
  whyBuilding: {
    title: "Why are we building Molecular Universe?",
    truth: "There's one simple, undeniable truth: There is no such thing as the perfect, one-size-fits-all battery. Especially not with the advent of an all-electric future.",
    mission: "That's why at SES AI, we've always sought to develop electrolytes for various practical battery chemistries including Li-Metal, high silicon Li-ion, and LFP Li-ion - for use across everything from drones to robotics, electric cars to urban air mobility, and grid storage to consumer electronics.",
    
    technologyTitle: "Battery Technology Starts with Small Molecules",
    allAbout: "In the battery world, it all comes down to small molecules.",
    universe: "While the universe of molecules is infinite, the universe of small molecules is not. It's measurable. In fact, we know that there are 10⁶⁰ possible small molecules in the universe. Of these, 10¹¹ could be used for batteries. And of those, less than 1,000 have been studied for batteries in the past 30 years.",
    waste: "So, we have only mapped one hundred millionth of the possible database. If that's all we need, it seems like an awful waste of molecules.",
    question: "Do we not want to know what's out there that could double, triple, or even quadruple the cycle life of LFP Li-ion, high silicon Li-ion, Li-Metal, and more?",
    
    targetTitle: "The Target is Set: 10¹¹ Small Molecules",
    targetMission: "The mission is clear: Map the physical and chemical properties of our database of 10¹¹.",
    computation: "Arriving at this goal required intense computational power. Originally, we considered establishing a non-profit organization Molecular Universe to crowdsource public computing resources and eventually open-source the database. However, we found a better solution.",
    solution: "It was far more efficient to commercially procure GPUs and collaborate with Nvidia on GPU-accelerated computation chemistry software. While we will not open-source our proprietary database, we will make Molecular Universe free to academic researchers and open-source certain aspects of our models wherever appropriate.",
    
    aboutMU0Title: "More About Molecular Universe, MU-0.5",
    aboutMU0Desc: "In our launch version of Molecular Universe, the Map consists of 10⁸ molecules and their molecular properties, including both actual experimental data and computational prediction based on Density Function Theory and Molecular Dynamics simulations.",
    largestDb: "This is the world's largest database of small molecule properties. And it will continue to grow to include more organic and inorganic molecules and more bulk and interphasial properties, suitable for additives, or salts, or solvents.",
    umap: "The molecules are represented on a map through a dimension-reduction data visualization technique called UMAP (Uniform Manifold Approximation and Projection). AI sees each molecule in 512 dimensions, but for us mere mortals, UMAP reduces them to a more navigable 2 Dimensions.",
    
    invitation: "We invite you to join us on this journey and be part of the mission.",
    makeContact: "Make contact with the Molecular Universe."
  },
  
  features: {
    title: "Features",
    
    map: {
      title: "Map",
      description: "Molecular Universe first became known for its molecular databases. Having the world’s largest databases of battery relevant properties for battery relevant molecules at one’s fingertips completely changed battery material discovery. In Molecular Universe (MU-1), we are expanding the databases to cover most liquid and solid battery electrolytes, including solvents, additives, diluents, salts, and solid state materials. We are offering 1M database fully viewable to the Public, and fully searchable to Research, Explorer and Team tiers, and 200M database fully searchable to Enterprise and Joint Development tiers with more in-depth properties. "
    },
    
    ask: {
      title: "Ask",
      description1: "As one of the most popular tools in Molecular Universe, Ask is like having the world-renowned battery scientists and engineers at your fingertips. MU-1 enhances Ask performance by integrating the latest GPT-5 models and SES proprietary training data including publications, patents, and human intuition. We are offering Lightning to the Public, and more advanced Pro and multi-agent Deep Space to Research, Explorer, Team, Enterprise and Joint Development tiers. The Deep Space now has senior scientist-level agentic capability to understand users’ queries and recommend full solutions including detailed reasoning, experiments and predictions. Deep Space is also fully integrated with Maps, Predict and other features in MU-1, it is one step closer to full agentic capability that can outperform the very best human battery scientists.",
    },
    
    search: {
      title: "Search",
      description: "As another popular tool in Molecular Universe, “Find-Friends” helps users find other molecules with similar physicochemical and/or structural properties as the input molecule, which is invaluable in helping users quickly broaden their horizon of possibilities in establishing new IPs. In MU-1, we are offering “Intelligent Find-Friends” that also takes into account the battery chemistry environment and desired performance for the molecules we are seeking, quickly identifying the top “friends” that are most relevant.",
    },
    
    formulate: {
      title: "Formulate",
      description: "Having mapped the world's largest molecular databases, for the first time, we are venturing beyond the molecular universe, and into the formulation universe, which involves much higher dimensions of complexity. Electrolytes are more than just single molecules, they are formulations consisting of ions dissociated and solved by solvent molecules, which interact in various manners among themselves. Here we have developed advanced computation chemistry tools such as molecular dynamics simulations driven by polarizable force fields that have achieved unprecedented accuracy, scale and speed for prediction of formulation level properties including viscosity, solubility, miscibility, conductivity, etc. Users can enter their desired formulations, and we will compute their properties."
    },

    design: {
      title: "Design",
      description: "Having explored the formulation universe, we continue our journey into the cell universe, an even higher dimension of complexity. Ultimately the cell level performance is what users care about most, since the final product is neither a molecule nor formulation, but a complete cell. We are truly in uncharted territory, as currently there are no known methodologies for connecting molecule and formulation properties to cell performance, the interfaces and interphases are simply beyond what first-principle can predict. Fortunately, the power of AI and machine learning, grounded in our massive effort to meticulously collect cell experimental performance data over diverse chemistries and as functions of different molecules and formulations is showing promise. Users can select a particular cell chemistry and different unknown molecules from the Molecular Universe to see their impact on cell performance and accurately predict cycle life."
    },

    predict: {
      title: "Predict",
      description: "Users can blindly input data of early cell cycle life, and MU-1 will predict end of life, all without any prior knowledge of the input cell chemistry or test environment."
    }
  },
  
  newsfeed: {
    title: "News Feed",
    newsLink: "News link",
    release1: "Molecular Universe MU-0 is released to public",
    releaseDate1: "April 29, 2025",
    releaseAbout1: "Molecular Universe MU-0 is released to public. Molecular Universe is designed as an advanced toolkit to map the entire realm of possible small molecules relevant to all battery chemistries, including Li-Metal, Li-ion, and sodium. There are five tiers, Research (free for anyone with an edu email), Explorer ($150 per month per user), Team ($1000 per month), all accessing 1 million molecules; Enterprise and Joint Development both accessing 100 million molecules.",
    release2: "Molecular Universe MU-0.5 is released to public",
    releaseDate2: "July 7, 2025",
    releaseAbout2: "Molecular Universe MU-0.5 is released to public. The most exciting new feature is Deep Space, which is an agentic capability to conduct senior scientist level battery research. Deep Space is built off of Molecular Universe's popular Ask feature and is powered by a multi-agent LLM. It can recommend electrolyte formulations for different cell chemistries ranked by performance, novelty, cost, or whatever the user desires. It also reduces time in trial and error and accomplishes in less than one hour what would normally take a human senior scientist months or even years. Deep Space is available to Enterprise and Joint Development users and limited to 10 per month for Team and Explorer users, and 5 per month for Research users. Other improvements include a molecule sketch pad to help users intuitively \"find friends\" and language support for Chinese and Korean in addition to English.",
    release3: "Molecular Universe MU-1.0 is released to public",
    releaseDate3: "October 20, 2025",
    releaseAbout3: "Molecular Universe MU-1.0 is released to public. This is the latest and most complete battery material discovery software and service platform. MU-1.0 is a quantum leap compared to earlier versions. It provides complete end-to-end material discovery workflow, including literature research and solution recommendation (“Ask”), molecule search (“Map” and “Search”), formulation development (“Formulate”), and cell performance prediction (“Predict”). MU-1.0 has the potential to accelerate battery material discovery from years to just tens of minutes. Also due to the popularity of Enterprise tiers, MU-1.0 now offers 3 sub tiers within Enterprise, providing greater service at greater value. Molecular Universe has already helped several Enterprise clients addressing their battery challenges, ranging from low temperature cycle life of LiFePO4 for energy storage, to safety and energy density of high content Silicon anode for drones & robotics, to cycle life of low and medium content Silicon anode for EV, and to high voltage stability of LiCoO2 cells. ",
  },

  // Footer
  footer: {
    products: "Our products",
    technology: "Technology",
    company: "Company",
    copyright: "Copyright © 2025 SES AI Corporation. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    productList: {
      ev: "EV",
      uam: "UAM", 
      drone: "Drone",
      molecularUniverse: "Molecular Universe",
      avatar: "Avatar"
    },
    technologyList: {
      liMetal: "Li-Metal",
      insights: "Insights",
      batteryWorld: "Battery world",
      demoDay: "Demo Day"
    },
    companyList: {
      aboutUs: "About Us",
      ourTeam: "Our Team",
      media: "Media",
      careers: "Careers",
      investors: "Investors",
      sustainability: "Sustainability",
      contactUs: "Contact Us"
    }
  },
  
  commercial_viability: {
    requires_rd: "Requires R&D to assess viability",
    likely_synthesizable_but_not_commercially_available: "Likely synthesizable but probably not commercially available",
    likely_synthesizable_may_be_commercially_available: "Likely synthesizable, may be commercially available",
    likely_commercially_available: "Commercially available"
  }
}; 
