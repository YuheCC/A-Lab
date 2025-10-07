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
      description: "Visualize millions of molecules on an interactive 2D map built using UMAP (Uniform Manifold Approximation and Projection)—a machine learning algorithm that turns high-dimensional chemical structure data into an intuitive, searchable map. Each point is a molecule embedded by its structure, and clusters represent chemical families. It's like Google Maps, but for chemistry: zoom into \"neighborhoods\" of similar molecules and uncover hidden gems. The MU-0.5 map features 25 molecular clusters and counting, and is the world's largest database of small molecules and battery-related properties."
    },
    
    ask: {
      title: "Ask",
      description1: "Now that you have the map, you need a navigation system. Ask is the navigation system that allows you to ask your questions in natural language. You can be general such as \"recommend an electrolyte for LiFePO4 and graphite cell\" or be specific such as \"recommend an electrolyte that is nonflammable and stable at high voltage 4.55V and can do 6C fast charge in a Li-ion cell with NCM811 cathode and silicon anode\".",
      description2: "It answers by recommending novel approaches that can address your challenge. The answer includes relevant formulations and molecules (solvents, additives and salts). It then searches these molecules in the Map and finds molecules with similar properties. Ask links cell-level, formualtion-level and molecule-level intelligence."
    },
    
    deepspace: {
      title: "Ask - Deep Space",
      description: "If regular Ask provides accurate answers to domain specific questions, Deep Space provides a practical solution to an actual challenge. Deep Space is one step closer to an agentic capability that delivers senior scientist level solutions and turbocharges battery R&D and product development from years to just tens of minutes. Deep Space does take much longer than regular Ask and asks a few questions about the query first to get a deeper understanding of the context before providing the final solution."
    },
    
    search: {
      title: "Search",
      description: "You can enter a \"molecules-of-interest\", it finds its location on the map, and recommends its \"friends\", which are other molecules with similar properties but might be located nearby or faraway on the map. This helps users broaden their horizon for possible molecules with similar properties. Search molecules in three powerful ways:",
      way1: "By structure - draw a molecule structure using the sketch pad",
      way2: "By SMILES – Input a canonical SMILES string and instantly retrieve all key info.",
      way3: "By molecule's name – input a molecule name such as \"ethylene carbonate\".",
      way4: "By natural language – Ask questions like: \"Find 5 molecules with LUMO above -1 eV and HOMO below -7 eV.\"",
      resultInfo: "Each result comes with a Molecule Info Card. Molecule's friends will be displayed checking the \"Find Friends\" box:",
      discover1: "Discover molecules that are structurally similar with similar properties (great for refinement),",
      discover2: "Or find structurally diverse options that still have similar properties (great for exploration).",
      similarity: "The \"friend\" molecules will be displayed in order of similarity—based specifically on their chemical and physical properties—from most to least similar. This balances exploration and exploitation—helping you expand possibilities while staying grounded in what works."
    },
    
    filter: {
      title: "Filter",
      description: "Need molecules with specific traits? Our property filters let you zero in on candidates with desirable features. All property values have been either measured in the lab or computed using traditional methods or predicted using AI/ML.",
      homo: "HOMO / LUMO: These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.",
      esp: "ESP Min / Max: Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.",
      functional: "Functional Groups: Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.",
      overlay: "You can even overlay your filtered molecules directly on the UMAP to visually explore chemical regions (molecular) that meet your criteria."
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