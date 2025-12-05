type Translator = ((key: string, defaultValue?: string) => string) | undefined;

const truthyStrings = new Set(['true', '1', 'yes', 'y', 'published']);
const falsyStrings = new Set(['false', '0', 'no', 'n', 'novel']);

export const extractIsPublished = (...sources: any[]): boolean | undefined => {
  for (const source of sources) {
    if (!source) continue;
    const candidate =
      source.is_published ??
      source.IS_PUBLISHED ??
      source.isPublished ??
      source?.properties?.is_published ??
      source?.properties?.IS_PUBLISHED ??
      source?.rawData?.is_published ??
      source?.rawData?.IS_PUBLISHED;

    if (candidate === undefined || candidate === null) continue;
    if (typeof candidate === 'boolean') return candidate;
    if (typeof candidate === 'number') return candidate !== 0;
    if (typeof candidate === 'string') {
      const normalized = candidate.trim().toLowerCase();
      if (truthyStrings.has(normalized)) return true;
      if (falsyStrings.has(normalized)) return false;
    }
    return Boolean(candidate);
  }
  return undefined;
};

export const buildPublicationProp = (isPublished: boolean | undefined, t?: Translator) => {
  if (isPublished === undefined) return null;
  const label = t ? t('search.publicationStatus.label', 'Status') : 'Status';
  const publishedText = t ? t('search.publicationStatus.published', 'Published') : 'Published';
  const novelText = t ? t('search.publicationStatus.novel', 'Novel Molecule') : 'Novel Molecule';
  return {
    label,
    value: isPublished ? publishedText : novelText,
    span: 2,
    wrap: true,
  };
};

export const insertPublicationProp = (props: any[], publicationProp: any | null) => {
  if (!publicationProp) return props;
  const next = [...props];
  const scoreIndex = next.findIndex((prop) => {
    const label = (prop?.label ?? '').toString().toLowerCase();
    return label.includes('score') || label.includes('grade');
  });
  if (scoreIndex >= 0) {
    next.splice(scoreIndex + 1, 0, publicationProp);
    return next;
  }
  const smilesIndex = next.findIndex((prop) => (prop?.label ?? '').toString().toLowerCase().includes('smiles'));
  const insertIndex = smilesIndex >= 0 ? smilesIndex + 1 : 0;
  next.splice(insertIndex, 0, publicationProp);
  return next;
};
