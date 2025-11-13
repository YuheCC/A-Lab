export default {
  modules: {
    consistency: {
      title: '批次内一致性分析',
      description: '随着全球新能源汽车和储能产业爆发式增长，锂电池生产产能需求激增。但电芯生产面临一致性差、良率波动大的核心痛点。传统依靠人工抽检和经验调整的模式难以实时捕捉微观工艺波动，导致批次间性能差异，直接增加售后成本并制约产能释放。SES结合生产工艺、质检、下游测试数据，分析生产工艺一致性，并识别影响质量的关联因素，有效提高良率。',
      imageTitle: '缺陷成因关联分析',
    },
    detection: {
      title: 'AI辅助缺陷检测',
      description: '为提升锂电池产品安全性，SES研发了一款基于多模态表征的AI辅助工具，专为锂离子电池生产质量控制设计，深度融合人工智能技术。系统利用生产线抽检获取的关键多模态表征数据（CT断层扫描、X射线成像、超声检测等），构建强大的AI分析引擎。',
      description2: '通过对这些高维、复杂数据的智能解析，系统可自动、快速且精准地识别电池内部及极片的各类潜在缺陷，如微短路、析锂、极片褶皱/断裂、涂布不均、异物夹杂、焊接不良等。其检测精度可达微米级别，显著超越传统人工目检或单一检测手段的局限。',
      imageTitle1: 'SES锂电池CT AI工具',
      imageTitle2: 'SES超声AI工具',
      result: {
        tree: {
          title: '检测列表',
        },
        imageViewer: {
          title: '检测图像',
          raw: '原图',
          point: '标记点',
          fullmark: '完整标记',
          imageLoadError: '图片加载失败或不存在',
        },
        table: {
          title: '检测数据',
          type: '类型',
          ohValue: 'OH值',
          noData: '暂无数据',
        },
        showMore: '更多... (剩余 {{count}} 项)',
      },
      charts: {
        leftOhRange: '左侧OH极差分布',
        leftOhStd: '左侧OH标准差分布',
        rightOhRange: '右侧OH极差分布',
        rightOhStd: '右侧OH标准差分布',
      },
    },
    kvalue: {
      title: 'K值预测与电芯分选',
      description: '此系统是一款专为电池制造打造的高性能自动分选解决方案。其核心功能是智能分析关键"化成"工序中获取的充放电数据（电压、电流、时间等），计算并预测每颗电芯的独特关键性能指标——K值（反映内阻特性）。',
      description2: '基于K值预测结果与预设质量标准，系统对电池进行快速、精准的自动分级（如优品、合格品、次品和废品）。其价值在于：在保证电池批次内性能高度一致的同时，显著提升生产线分选效率，让电芯的快速分选成为可能。',
      imageTitle1: '化成数据',
      imageTitle2: '特征提取',
    },
    sorting: {
      title: 'Pack一致性分选',
      description: '在由多个Pack组成的储能系统中，Pack一致性是影响安装和后续系统性能的关键因素之一。SES通过算法分析和Pack表征机制，设计了Pack一致性分选算法。',
      description2: '算法实现高效的Pack级分选，摒弃传统耗时费力的静态满容量充放电测试或单一初始参数（如开路电压）匹配方法，转而深度融合准工况数据下Pack的多维度动态表征。旨在显著提升系统集成效率和全生命周期性能的同时，降低安装与维护成本。',
      imageTitle: 'Pack一致性分布可视化',
    },
  },
  buttons: {
    startDemo: '开始演示',
    contactSales: '联系销售',
  },
  steps: {
    upload: '上传数据',
    detection: 'AI检测分析',
    results: '查看结果',
  },
  upload: {
    title: '上传您的数据或使用演示数据',
    description: '支持CSV、Excel格式的批量数据',
    useDemoData: '使用演示数据',
    downloadDemo: '下载演示文件',
  },
  processing: {
    title: 'AI检测进行中...',
    processing: '正在处理',
    step1: '数据预处理',
    step2: 'AI模型分析',
    step3: '生成报告',
  },
  result: {
    complete: '检测完成！',
    fileAnalyzed: '文件',
    fileSuccess: '已成功分析',
    relatedImages: '相关分析图像',
    chartTitle: '分析结果',
    chartPlaceholder: '图表展示区域',
    treeView: {
      title: '生产线结构',
    },
    stats: {
      score: '分析评分',
      scoreDesc: '优秀表现',
      passed: '通过项目',
      passedDesc: '94% 通过率',
      attention: '需要关注',
      attentionDesc: '需要人工审核',
      items: '项',
    },
    summary: {
      title: '分析总结',
      point1: '整体表现优秀，准确度高',
      point2: '大多数项目符合质量标准',
      point3: '部分项目需要额外关注和人工审核',
      point4: '结果显示数据集具有一致的模式',
    },
    backToIntro: '返回介绍',
    exportReport: '导出报告',
  },
  charts: {
    shap: {
      title: 'SHAP特征重要性摘要',
      xAxisName: '平均|SHAP值|',
      seriesName: '特征重要性',
    },
    scatter: {
      title: 'SHAP散点图',
      featureValue: '特征值',
      shapValue: 'SHAP值',
      high: '高',
      low: '低',
    },
    featureImportance: {
      title: '特征影响力分析',
    },
  },
};
