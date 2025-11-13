export default {
  modules: {
    consistency: {
      title: 'Intra-Batch Consistency Analysis',
      description: 'With the explosive growth of the global new energy vehicle and energy storage industries, lithium battery production capacity demand has surged. However, battery cell production faces core pain points of poor consistency and large yield fluctuations. Traditional models relying on manual sampling and experience-based adjustments struggle to capture microscopic process fluctuations in real-time, leading to performance differences between batches, directly increasing after-sales costs and constraining capacity release. SES combines production processes, quality inspection, and downstream testing to analyze production process consistency and identify correlation factors affecting quality, effectively improving yield rates.',
      imageTitle: 'Correlation Analysis of Defect Causes',
    },
    detection: {
      title: 'AI-Assisted Defect Detection',
      description: 'To improve lithium battery product safety, SES has developed an AI-assisted tool based on multi-modal characterization, specifically designed for lithium-ion battery production quality control with deep integration of artificial intelligence technology. The system utilizes key multi-modal characterization data (CT tomography, X-ray imaging, ultrasonic detection, etc.) obtained from production line sampling inspections to build a powerful AI analysis engine.',
      description2: 'Through intelligent analysis of these high-dimensional, complex data, the system can automatically, rapidly, and precisely identify various potential defects in battery internals and electrode sheets, such as micro short circuits, lithium plating, electrode sheet wrinkles/breaks, uneven coating, foreign object inclusion, poor welding, etc. Its detection accuracy can reach micron level, significantly surpassing the limitations of traditional manual visual inspection or single detection methods.',
      imageTitle1: 'SES Lithium Battery CT AI Tool',
      imageTitle2: 'SES Ultrasonic AI Tool',
      result: {
        tree: {
          title: 'Detection List',
        },
        imageViewer: {
          title: 'Detection Images',
          raw: 'Raw Image',
          point: 'Point Markers',
          fullmark: 'Full Markers',
        },
        table: {
          title: 'Coordinate Data',
          index: 'Index',
          x: 'X Coordinate',
          y: 'Y Coordinate',
        },
      },
      charts: {
        defectTrend: 'Defect Trend',
        confidence: 'Confidence Distribution',
        areaDistribution: 'Area Distribution',
        timeSeries: 'Time Series',
      },
    },
    kvalue: {
      title: 'K-Value Prediction & Cell Sorting',
      description: 'This system is a high-performance automatic sorting solution specifically designed for battery manufacturing. Its core function is to intelligently analyze charge-discharge data (voltage, current, time, etc.) obtained during the critical "formation" process, calculating and predicting the unique key performance indicator for each battery cell - the K-value (reflecting internal resistance characteristics).',
      description2: 'Based on K-value prediction results and preset quality standards, the system performs rapid, precise automatic grading of batteries (such as premium, qualified, secondary, and scrap products). Its value lies in: ensuring highly consistent performance within battery batches while significantly improving production line sorting efficiency, making rapid cell sorting possible.',
      imageTitle1: 'Formation Data',
      imageTitle2: 'Feature Extraction',
    },
    sorting: {
      title: 'Pack Consistency Sorting',
      description: 'In energy storage systems composed of multiple packs, pack consistency is one of the key factors affecting installation and subsequent system performance. SES has designed a pack consistency sorting algorithm through algorithmic analysis and pack characterization mechanisms.',
      description2: 'The algorithm achieves efficient pack-level sorting, abandoning traditional time-consuming and labor-intensive static full-capacity charge-discharge testing or single initial parameter (such as open-circuit voltage) matching methods. Instead, it deeply integrates multi-dimensional dynamic characterization of packs under quasi-operating condition data. It aims to significantly improve system integration efficiency and full lifecycle performance while reducing installation and maintenance costs.',
      imageTitle: 'Pack Consistency Distribution Visualization',
    },
  },
  buttons: {
    startDemo: 'Start Demo',
    contactSales: 'Contact Sales',
  },
  steps: {
    upload: 'Upload Data',
    detection: 'AI Detection Analysis',
    results: 'View Results',
  },
  upload: {
    title: 'Upload Your Data or Use Demo Data',
    description: 'Supports CSV, Excel format batch data',
    useDemoData: 'Use Demo Data',
    downloadDemo: 'Download Demo File',
  },
  processing: {
    title: 'AI Detection in Progress...',
    processing: 'Processing',
    step1: 'Data Preprocessing',
    step2: 'AI Model Analysis',
    step3: 'Generating Report',
  },
  result: {
    complete: 'Detection Complete!',
    fileAnalyzed: 'File',
    fileSuccess: 'has been successfully analyzed',
    relatedImages: 'Related Analysis Images',
    chartTitle: 'Analysis Results',
    chartPlaceholder: 'Chart Display Area',
    stats: {
      score: 'Analysis Score',
      scoreDesc: 'Excellent performance',
      passed: 'Items Passed',
      passedDesc: '94% pass rate',
      attention: 'Attention Needed',
      attentionDesc: 'Require manual review',
      items: 'Items',
    },
    summary: {
      title: 'Analysis Summary',
      point1: 'Overall performance is excellent with high accuracy',
      point2: 'Most items meet quality standards',
      point3: 'Some items require additional attention and manual review',
      point4: 'Results show consistent patterns across the dataset',
    },
    backToIntro: 'Back to Introduction',
    exportReport: 'Export Report',
  },
  charts: {
    shap: {
      title: 'SHAP Feature Importance Summary',
      xAxisName: 'Mean |SHAP Value|',
      seriesName: 'Feature Importance',
    },
  },
};
