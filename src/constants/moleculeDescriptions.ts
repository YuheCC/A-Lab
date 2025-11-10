/**
 * 分子描述映射文件
 * 提供分子的化学性质和用途说明（中英日韩四种语言）
 */

/**
 * 分子描述接口
 */
export interface MoleculeDescription {
  zh: string; // 中文描述
  en: string; // 英文描述
  ja?: string; // 日语描述（可选）
  ko?: string; // 韩语描述（可选）
}

/**
 * 分子描述映射表
 * key: 分子名称
 * value: 分子描述（中英文）
 */
export const MOLECULE_DESCRIPTIONS: Record<string, MoleculeDescription> = {
  'CCOC(=O)OCC': {
    zh: 'DEC 的熔点在所有文献、手册和目录中都被记录为 "-43°C"，这一数据源于 1921 年的单一错误来源，在 70 多年间从未被任何人通过实验验证。该数据已在 2001 年得到纠正（DOI 10.1149/1.1353568），经过精确校准后确定为 -74.3°C。',
    en: 'The mp of DEC has been registered as "-43 oC" in all literature, handbooks and catalogs, which originated from a single source of error in 1921, and was never experimentally verified by anyone for more than 70 years. This data has been corrected in 2001 (DOI 10.1149/1.1353568) with precise calibration to be -74.3 oC.',
    ja: 'DEC の融点は、すべての文献、ハンドブック、カタログで "-43°C" として記録されてきましたが、これは 1921 年の単一の誤った情報源に由来し、70 年以上にわたって誰も実験的に検証していませんでした。このデータは 2001 年に修正され（DOI 10.1149/1.1353568）、精密な校正により -74.3°C と確定されました。',
    ko: 'DEC의 녹는점은 모든 문헌, 핸드북 및 카탈로그에서 "-43°C"로 등록되어 있었는데, 이는 1921년의 단일 오류 출처에서 비롯되었으며 70년 이상 동안 누구도 실험적으로 검증하지 않았습니다. 이 데이터는 2001년에 수정되었으며(DOI 10.1149/1.1353568), 정밀한 교정을 통해 -74.3°C로 확인되었습니다.',
  },
  'DEC': {
    zh: 'DEC 的熔点在所有文献、手册和目录中都被记录为 "-43°C"，这一数据源于 1921 年的单一错误来源，在 70 多年间从未被任何人通过实验验证。该数据已在 2001 年得到纠正（DOI 10.1149/1.1353568），经过精确校准后确定为 -74.3°C。',
    en: 'The mp of DEC has been registered as "-43 oC" in all literature, handbooks and catalogs, which originated from a single source of error in 1921, and was never experimentally verified by anyone for more than 70 years. This data has been corrected in 2001 (DOI 10.1149/1.1353568) with precise calibration to be -74.3 oC.',
    ja: 'DEC の融点は、すべての文献、ハンドブック、カタログで "-43°C" として記録されてきましたが、これは 1921 年の単一の誤った情報源に由来し、70 年以上にわたって誰も実験的に検証していませんでした。このデータは 2001 年に修正され（DOI 10.1149/1.1353568）、精密な校正により -74.3°C と確定されました。',
    ko: 'DEC의 녹는점은 모든 문헌, 핸드북 및 카탈로그에서 "-43°C"로 등록되어 있었는데, 이는 1921년의 단일 오류 출처에서 비롯되었으며 70년 이상 동안 누구도 실험적으로 검증하지 않았습니다. 이 데이터는 2001년에 수정되었으며(DOI 10.1149/1.1353568), 정밀한 교정을 통해 -74.3°C로 확인되었습니다.',
  },
};

/**
 * 获取分子描述
 * @param moleculeName 分子名称
 * @param locale 语言环境 ('zh' | 'en' | 'ja' | 'ko')
 * @returns 分子描述字符串，如果不存在则返回 undefined
 */
export function getMoleculeDescription(
  moleculeName: string,
  locale: 'zh' | 'en' | 'ja' | 'ko' = 'zh'
): string | undefined {
  const description = MOLECULE_DESCRIPTIONS[moleculeName];
  if (!description) return undefined;

  // 如果请求的语言不存在，尝试降级到英文或中文
  return description[locale] || description.en || description.zh;
}

/**
 * 检查分子是否有描述
 * @param moleculeName 分子名称
 * @returns 是否存在描述
 */
export function hasMoleculeDescription(moleculeName: string): boolean {
  return moleculeName in MOLECULE_DESCRIPTIONS;
}
