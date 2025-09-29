export default {
  nodePopup: {
    title: "分子详情",
    smiles: "SMILES",
    umapCoordinates: "UMAP坐标",
    properties: "属性",
    copyAllData: "复制所有数据",
    addToFavorites: "添加到收藏",
    saving: "保存中...",
    copySuccess: "分子信息已复制到剪贴板！",
    copyError: "复制分子数据失败"
  },
  molCard: {
    moleculeInfo: "分子信息",
    invalidData: "无效的分子数据结构。",
    noMoleculeData: "无可用分子数据。",
    loading: "加载中...",
    clickForDetails: "点击分子查看更多详情。",
    notAvailable: "N/A",
    clickToCollapse: "点击收起",
    clickToExpand: "点击展开查看更多详情"
  },
  moleculeModal: {
    original: "原始分子",
    findSimilar: "查找相似",
    similarWithCount: "相似分子 ({{count}})",
    functionalGroupsTitle: "功能基团",
    functionalGroupList: "醚、缩酮、碳酸酯、酯",
    unknown: "未知",
    types: {
      solvent: "溶剂",
      cosolvent: "共溶剂",
      diluent: "稀释剂",
      additive: "添加剂"
    },
    additiveSubtypes: {
      title: "添加剂子类别",
      seiPromoter: "SEI 促进剂",
      sideReactionSuppressor: "副反应抑制剂",
      dendriteSuppressor: "枝晶抑制剂",
      interfacialStabilityImprover: "界面稳定性改进剂"
    },
    properties: {
      predictedFp: "预测闪点",
      combustionEnthalpy: "燃烧焓",
      commercialViability: "商业可行性"
    }
  },
  umapPlot: {
    controls: {
      resetViewport: "重置视图",
      zoomIn: "放大",
      zoomOut: "缩小"
    },
    properties: {
      cluster: "Cluster",
      molWeight: "Mol Weight",
      espMax: "Esp Max",
      espMin: "Esp Min",
      homo: "HOMO",
      lumo: "LUMO",
      predictedMp: "Predicted MP",
      predictedBp: "Predicted BP",
      llmGrade: "LLM Grade"
    },
    units: {
      gPerMol: " g/mol",
      eV: " eV",
      celsius: " °C"
    }
  }
}; 