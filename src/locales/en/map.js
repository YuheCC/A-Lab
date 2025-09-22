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
    description1: 'Molecular Universe MU-0.5 is a battery material discovery software and service platform. It maps more battery-relevant properties of small molecules than ever before and powers a navigation system driven by a battery-specific LLM—like having world-renowned battery scientists at your fingertips. Through MU-0.5, we provide tiered joint-development services for customers working on Li-metal, silicon Li-ion, LFP, and other chemistries.',
    description2: 'Within the Molecular Universe, we use 2D maps to visualize a 512-dimensional molecular space through the UMAP (Uniform Manifold Approximation and Projection) algorithm. Our integrated datasets form what we believe to be the world\'s largest and continuously growing database of battery-relevant molecules and properties. Users can interact with the map to filter, search, and ask natural-language questions that accelerate next-generation battery development.',
    description3: 'The MAP feature currently presents two molecular maps: organic and inorganic. Most known battery solvents are organic, while inorganic solvents—largely unexplored—hold promise for unique SEI film formation, improved stability, and enhanced electrochemical performance. At SES, we are expanding the inorganic space to aid the search for stable inorganic solvents and additives that could advance battery technologies.',
    description4: 'To build the inorganic map, we employ a rule-based generation approach: constructing linear, cyclic, and polycyclic backbones, introducing branches and structural variations, populating them with inorganic atoms, assigning bond orders, and attaching terminal groups to complete the structures.',
    description5: 'Finally, the MU-1 organic map organizes 25 molecular clusters, as labeled below. This map will continue to expand as we probe deeper into the Molecular Universe.',
    description6: 'The MU-1 inorganic map consists of 7 molecular clusters, they are labeled as below. We will be updating this map as we explore deeper into the Molecular Universe.',
    clusterTitle: 'Cluster Descriptions',
    organicTitle: 'Organic Molecule Clusters',
    inorganicTitle: 'Inorganic Molecule Clusters'
  },
  anionsClusters: {
    title: 'Anions Molecular Clusters',
    description: 'The anions molecular dataset contains 19 distinct molecular clusters, each with unique chemical characteristics and structural properties.',
    cluster0: '5-member heterocyclic rings with 2N and 1S.',
    cluster1: '5-member heterocyclic rings w 2 adjacent pyridine-like & 1 pyrrole-like N.',
    cluster2: '5-member heterocyclic rings with 1 pyridine-like & 1 pyrrole-like adjcent N.',
    cluster3: 'presence of sulfonyl groups and tertiary amines​.',
    cluster4: 'sulfonamide groups & condensed aliphatic heterocyclic structures.',
    cluster5: 'sulfonamide groups & aliphatic heterocyclic structures​ NOT condensed.',
    cluster6: 'condensed aromatic heterocyclic structures w N, S & O heteroatoms.',
    cluster7: '5/6-member heterocyclic structures with carboxylic (EC-like) and amide groups.',
    cluster8: 'B-containing compounds.',
    cluster9: 'Si-containing compounds.',
    cluster10: '5-member heterocyclic structures with N-O bond.',
    cluster11: '5-member heterocyclic structures with N-S bond.',
    cluster12: '5-member heterocyclic structures with N-S bond​ (very similar to cluster #11).',
    cluster13: 'furan group.',
    cluster14: 'imidazole and thiazole groups.',
    cluster15: 'condensed aliphatic heterocyclic structures with amine, ether and amide groups.',
    cluster16: 'heterocyclic structures with N and O.',
    cluster17: 'condensed (1 aromatic + 1 aliphatic) heterocyclic structures with amine, ether and amide groups.',
    cluster18: 'pyridine and pyrimidine structures.',
  },
  clusters: {
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
