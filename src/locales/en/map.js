export default {
  tabs: {
    organic: 'Organic',
    inorganic: 'Inorganic',
    anions: 'Anions'
  },
  loading: {
    message: 'Loading Map of the Molecular Universe',
    error: 'Error loading data',
    noData: 'No data available'
  },
  about05: {
    title: 'About Molecular Universe',
    description1: 'Molecular Universe MU-0.5 is a battery material discovery software and service platform. We mapped more battery relevant properties of more battery relevant small molecules than ever before and trained a navigation system powered by a battery-specific llm that\'s like having world-renowned battery scientists at your fingertips. Now we can offer different levels of joint development services to customers across Li-Metal, silicon Li-ion, LFP, and many others.',
    description2: 'This 2D map visualizes a 512 dimensional universe of small molecules through a dimension reduction algorithm called UMAP (Uniform Manifold Approximation and Projection). It\'s the world\'s largest database of battery relevant molecules and properties that we know of, and constantly growing. Users can interact, filter, search and ask questions in natural language to accelerate their next generation battery development.',
    description3: 'In MU-0.5, the map consists of 25 molecular clusters, they are labeled as below. We will be updating this map as we explore deeper into the Molecular Universe.',
    clusterTitle: 'Cluster Descriptions'
  },
  clusters05: {
    clusterName: 'Cluster',
    cluster0: 'is characterized by Sulfone, Alkyne, NitroSulfonylFluoride functional groups.',
    cluster1: 'is characterized by Heterocyclic-P-CO-1, Amide, Amine functional groups.',
    cluster2: 'is characterized by Heterocyclic-P-CS-1, Amide, Amine functional groups.',
    cluster3: 'is characterized by FluoroSulfonyl, Sulfone, Alkene functional groups.',
    cluster4: 'is characterized by Ether, Heterocyclic-P-CN-2, Thioketone functional groups.',
    cluster5: 'is characterized by Pyridine, Ketone, Thioketone functional groups.',
    cluster6: 'is characterized by Heterocyclic-P-CS-1, Amide, Amine functional groups.',
    cluster7: 'is characterized by Heterocyclic-P-CO-1, Amide, Thioamide functional groups.',
    cluster8: 'is characterized by Sulfone, Amide, FluoroSulfonyl functional groups.',
    cluster9: 'is characterized by Amino carbonyl, Imide, Amine functional groups.',
    cluster10: 'is characterized by Amine, Ether, Ketal functional groups.',
    cluster11: 'is characterized by Arene, Amide, Halogen functional groups.',
    cluster12: 'is characterized by Arene, Ketal, Ether functional groups.',
    cluster13: 'is characterized by Amide, Amine, Heterocyclic-P-CO-1 functional groups.',
    cluster14: 'is characterized by Amide, Amine, Alkene functional groups.',
    cluster15: 'is characterized by Amide, Amine, Disulfide functional groups.',
    cluster16: 'is characterized by Amine, Amide, Heterocyclic-P-CO-1 functional groups.',
    cluster17: 'is characterized by Sulfonate ester, Sulfone, BoronicAcid functional groups. (This cluster contains DTD.)',
    cluster18: 'is characterized by Arene, Amide, Halogen functional groups.',
    cluster19: 'is characterized by Ketone, Sulfone, Halogen functional groups. (This cluster contains EC, PC, FEC, DEC, DMC, DME, and F5DEE.)',
    cluster20: 'is characterized by Amide, Amine, Heterocyclic-P-CO-1 functional groups.',
    cluster21: 'is characterized by Heterocyclic-P-CO-1, Ketone, Heterocyclic-P-CS-1 functional groups.',
    cluster22: 'is characterized by Arene, Imide, Amide functional groups.',
    cluster23: 'is characterized by Amine, Nitro, Pyridine functional groups.',
    cluster24: 'is characterized by Amide, Amine, Ether functional groups.'
  },
  about: {
    title: 'About Molecular Universe',
    description1: 'Molecular Universe (MU) is a materials discovery platform oriented towards battery applications. At its core, the platform is powered by a database of molecular structures and properties. To our knowledge, the current database (termed MU-1) is the world’s largest collection of molecular properties for battery-relevant molecules.  Furthermore, the database is constantly growing.',
    description2: 'To help our users navigate this exhaustive chemical space, we also trained a navigation system powered by a battery-specific large-language model (LLM). The LLM provides an expert guide, akin to having a team of world-renowned battery scientists at your fingertips. Through the MU platform, we are now able to offer different levels of joint development services to customers across battery chemistries including lithium metal, Li-ion with silicon anode, lithium iron phosphate (commonly known as LFP), and many others.',
    description3: 'The 2D map on this page visualizes the chemical space of these neutral organic molecules (to be used as solvents, additives, or diluents in batteries) by applying a dimensionality reduction algorithm to a 512-dimensional molecular fingerprint. The dimensionality reduction algorithm used here is called UMAP, which stands for Uniform Manifold Approximation and Projection. This map serves as a entry point for a journey into the universe of molecules, where users can interact, filter, search, and ask questions in natural languages (English, Chines, Korean and Japanese) to accelerate their next generation battery development.',
    description4: 'In MU-1 (the current release), the map consists of 19 molecular clusters, which are described below. We will keep updating this map as we explore more expansive molecular universe.',
    clusterTitle: 'Cluster Descriptions',
    organicTitle: 'Organic Molecule Clusters',
    inorganicTitle: 'Inorganic Molecule Clusters'
  },
  anionsClusters: {
    title: 'The Anionic Molecular Universe',
    description: 'Anions provide a counter-ion to the working ions (such as Li+, Na+ etc) and construct a salt fro the battery electrolyte. The anions used in an electrolyte have a dramatic impact on electrolyte properties and battery performance, because they contribute to ionic conductivity, electrolyte stability, and interphasial chemistries during battery cycling.',
    description2: 'To date, the space of anions explored for battery applications is quite small, spanning only a few well-known structures. As part of our effort to chart a course through the Molecular Universe, we are cataloging a collection of novel anionic structures that appear promising for use in battery electrolytes. Our database includes the molecules themselves as well as properties important for designing battery electrolytes.',
    description3: 'The map on this page visualizes this chemical space by applying a dimensionality reduction algorithm (UMAP) to a 512-dimensional molecular fingerprint for each anionic structure in the database. There are 13 distinct clusters evident in the data, which are detailed below.',
    cluster0: 'Fluoro-sulfonamide and sulfonyl groups.',
    cluster1: 'Fluoro-sulfonamide and sulfonyl groups attached to heterocyclic aromatic structures.',
    cluster2: 'Fused aromatic and aliphatic cyclic structures.',
    cluster3: 'Arene groups, typically heterocylic aromatic substructures such as pyridine, pyrimidine, and pyridazine​.',
    cluster4: 'Sulfonyl zwitterions and heterocyclic aromatic six-membered rings.',
    cluster5: 'Heterocyclic five-membered rings.',
    cluster6: 'Tetra-coordinated B- anions accompanied by sulfonyl or fluoro-sulfonyl groups.',
    cluster7: 'Trifluoro-methyl or trifluoro-borane groups and phosphoryl-like groups.',
    cluster8: 'Trifluoro-methyl or trifluoro-borane groups accompanied by heterocyclic aliphatic rings (usually containing boron, oxygen, or nitrogen heteroatoms).',
    cluster9: 'Tri-coordinate phosphorous atoms.',
    cluster10: 'Trifluoro-methyl and trifluoro-borane groups (all of these clusters exhibit similar molecular motifs).',
    cluster11: 'Trifluoro-methyl and trifluoro-borane groups (all of these clusters exhibit similar molecular motifs).',
    cluster12: 'Trifluoro-methyl and trifluoro-borane groups (all of these clusters exhibit similar molecular motifs).'
  },
  clusters: {
    clusterName: 'Cluster',
    cluster0: '5-membered heterocyclic rings containing nitrogen and sulfur.',
    cluster1: '5-membered heterocyclic rings containing two adjacent pyridine-like and one pyrrole-like nitrogen atoms.',
    cluster2: '5-membered heterocyclic rings containing one adjacent pyridine-like and one pyrrole-like nitrogen atoms.',
    cluster3: 'Sulfonyl groups and tertiary amines​.',
    cluster4: 'Sulfonamide groups and fused aliphatic heterocyclic structures.',
    cluster5: 'Sulfonamide groups and isolated aliphatic heterocyclic structures.',
    cluster6: 'Condensed aromatic heterostructures with nitrogen, sulfur, and oxygen heteroatoms.',
    cluster7: 'Five- and six-membered heterocyclic ring structures with carboxylic and amide groups.',
    cluster8: 'Contains boron.',
    cluster9: 'Contains silicon.',
    cluster10: 'Five-membered heterocyclic structures containing nitrogen-oxygen bonds.',
    cluster11: 'Five-membered heterocyclic structures containing nitrogen-sulfur bonds.',
    cluster12: 'Five-membered heterocyclic structures containing nitrogen-sulfur bonds and sulfonyl functional groups.',
    cluster13: 'Contains furan groups.',
    cluster14: 'Contains imidazole and thiazole groups.',
    cluster15: 'Condensed aliphatic heterostructures with amine, ether, and amide groups.',
    cluster16: 'Heterocyclic structures containing nitrogen and oxygen.',
    cluster17: 'Fused-ring heterocyclic structures with amine, ether, and amide groups.',
    cluster18: 'Pyridine and pyrimidine structures.'
  },
  inorganicClusters: {
    cluster1: 'Cyclic, bridged molecules with double-bonding present in the ring structure, but no sulfur atoms.',
    cluster2: 'Cyclic, bridged molecules with no double-bonding present in the core ring, and no sulfur atoms.',
    cluster3: 'Linear molecules with no sulfur atoms.',
    cluster4: 'Cylic/bridged molecules containing S=O functional groups, but lacking double-bonding in the core ring structure.',
    cluster5: 'Linear molecules with S=O functional groups present.',
    cluster6: 'Cyclic molecules with double-bonding present in the core ring structure, where sulfur atoms are generally present in double-bonded motifs.',
    cluster7: 'Cyclic molecules with double-bonding present in the core ring structure, where sulfur atoms are present in a range of bonding patterns.'
  },
  inorganic: {
    title: 'Visualizing the Inorganic Molecular Universe',
    motivation: {
      title: 'Motivation',
      content: 'Inorganic solvents present an opportunity to unique SEI film formation that may impart superior stability & electrochemical performance. However, inorganic solvents are basically unexplored, with only a few known examples to date, many of which are gases that rely on liquefication for practical use in battery. At SES, we aim to scan a broader space of inorganic molecules in search of a stable inorganic solvent or additive that can improve battery performance.'
    },
    datasetGeneration: {
      title: 'Dataset Generation',
      generativeAlgorithm: {
        title: 'Generative Algorithm',
        content: 'Dengpan has written a rules-based algorithm to enumerate chemically feasible inorganic molecules. The algorithm isn\'t perfect, but the majority of the generated molecules are chemically valid. Note that "chemically valid" does not guarantee stability, only that the "textbook rules" of valence and bonding have not been violated by the structure. The initial generative algorithm was run to produce 4.5 million inorganic molecules, of which we selected 1 million to create an initial dataset.'
      },
      dftCalculations: {
        title: 'DFT Calculations',
        initialConvergence: {
          title: 'Initial Convergence',
          content: 'Most of the DFT calculations did not converge – only ~240,000 DFT calculations finished. As chemists, this likely should not surprise us – small, neutral inorganic molecules can be rather tricky to stabilize. We preserved the 240,000 structures which completed successfully and further analyzed them.'
        },
        geometryChecking: {
          title: 'Geometry Checking',
          content: 'On closer inspection, it turns out that some molecules, even though their DFT calculations converged, fragmented into multiple molecular fragments during geometry relaxation. We decided to discard these cases, further reducing our "valid" examples to 165,138 molecules – that is, those molecules which successfully converged in DFT, successfully found a minimum-energy structure, and did not separate into multiple fragments while finding that minimum energy structure.'
        }
      }
    },
    visualization: {
      title: 'Visualization',
      preprocessing: {
        title: 'Pre-processing',
        content: 'For each of the 165,138 "valid" molecules in the dataset (see above), we generated RDKit molecules and the Avalon fingerprint using RDKit\'s built-in Pandas toolkit. This work was performed on the OSC Cardinal cluster.'
      },
      dimensionalityReduction: {
        title: 'Dimensionality Reduction',
        content: 'We generated 512-dimensional fingerprints for the molecules. Because humans can\'t visualize 512 dimensions, we apply the UMAP dimensionality reduction approach to create a 2D dataset that strives to preserve the local and global relationships between data points in the higher dimension. To find the best values of the UMAP, we swept the following parameters: Nearest neighbors: 20, 30, 50, 100, 150, 200; Minimum distances: 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9. The "best" set of parameters was chosen by visual inspection, since the primary utility of this map is to provide a qualitative visual guide for scientific users. For the sake of completeness, a grid is shown below (the plots are very small, of course). We decided that 20 nearest neighbors at a minimum distance of 0.2 provided the best balance of visual dispersion and useful clustering.'
      },
      clusterLabeling: {
        title: 'Cluster Labeling',
        content: 'To facilitate downstream search & sampling algorithms, it is beneficial to let an unsupervised clustering algorithm "discover" the cluster labels. This is also fundamentally a human exercise, so we performed another parameter sweep using the HDBSCAN algorithm. This time, we swept: Cluster sizes: 2000, 3000, 4000, 5000; Sample sizes: 400, 500, 600, 700; Epsilon values: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7. We applied the parameter sweep to the UMAP dataset with the best UMAP parameters from the above step (20, 0.2). The parameter sweep is sufficiently large so that it isn\'t productive to include all the figures, but one is shown below to demonstrate the effect of the sweep: After manually inspecting samples from each cluster, cluster size 2000, sample size 400, and epsilon 0.5 was found to give the most chemically reasonable clusters.'
      }
    },
    result: {
      title: 'Result',
      content: 'The final product is shown below. The cluster label for "5" is hard to find – it\'s the small purple cluster along the bottom. Overall, we find that three structural features control the clustering, in descending order of importance: Whether the molecule is cyclic or linear; Whether a cyclic molecule has double-bonding in the core ring or not; The bonding pattern of sulfur in the molecule (and whether the molecule has sulfur at all). Some samples from each cluster are shown and discussed below.'
    },
    clusterTitle: 'Inorganic Molecule Clusters',
    placeholder: 'Inorganic molecule image to be added',
    clusterInfo: 'Inorganic molecule cluster information: to be added',
    clusters: {
      title: 'Inorganic Molecule Cluster Analysis',
      description: 'Based on structural features, inorganic molecules are divided into 6 main clusters:',
      cluster1: 'Cyclic, bridged molecules with double-bonding present in the ring structure, but no sulfur atoms.',
      cluster2: 'Cyclic, bridged molecules with no double-bonding present in the core ring, and no sulfur atoms.',
      cluster3: 'Linear molecules with no sulfur atoms.',
      cluster4: 'Cyclic/bridged molecules containing S=O functional groups, but lacking double-bonding in the core ring structure.',
      cluster5: 'Linear molecules with S=O functional groups present.',
      cluster6: 'Cyclic molecules with double-bonding present in the core ring structure, where sulfur atoms are generally present in double-bonded motifs.'
    }
  },
  footer: {
    agreement: 'By using Molecular Universe, you agree to our',
    termsLink: 'Terms and Privacy Policy.',
    systemRequirements: 'This interactive UMAP runs best on devices from 2019 or newer with at least 8 GB RAM and a modern processor (e.g. Apple M1+, Intel i5+), as older or lower-end systems may experience lag or loading issues.',
    citation: 'Molecule Renderer (Smiles Drawer, Daniel Probst et. al):',
    closeButton: 'Close this panel'
  },
  imageAlt: 'Molecular Universe Clusters Map'
};
