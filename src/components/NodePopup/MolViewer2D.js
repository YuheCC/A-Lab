import { useEffect, useMemo, useState } from 'react';
import { formatSmilesWithCation } from '@/utils';
import { loadRDKit } from '@/utils/rdkitLoader';

const DEFAULT_DIMENSION = 200;
const MAX_CACHE_ENTRIES = 200;
const svgCache = new Map();

const promoteCacheEntry = (key) => {
  const entry = svgCache.get(key);
  if (!entry) return entry;
  svgCache.delete(key);
  svgCache.set(key, entry);
  return entry;
};

const evictIfNeeded = () => {
  if (svgCache.size <= MAX_CACHE_ENTRIES) return;
  const iterator = svgCache.keys();
  const oldestKey = iterator.next().value;
  if (typeof oldestKey !== 'undefined') {
    svgCache.delete(oldestKey);
  }
};

const getCachedSvg = (key, creator) => {
  if (!key) return creator();

  const cached = svgCache.get(key);
  if (cached) {
    if (cached.status === 'resolved') {
      promoteCacheEntry(key);
      return Promise.resolve(cached.value);
    }
    return cached.promise;
  }

  const promise = creator()
    .then((value) => {
      svgCache.set(key, { status: 'resolved', value });
      evictIfNeeded();
      return value;
    })
    .catch((error) => {
      svgCache.delete(key);
      throw error;
    });

  svgCache.set(key, { status: 'pending', promise });
  return promise;
};

const sanitizeSvg = (svg, theme) => {
  if (!svg) return '';
  let output = svg.replace(/<\?xml[^>]*>/i, '').trim();

  if (theme === 'dark') {
    output = output.replace(
      /stroke([:=])(['"]?)#000000\2/gi,
      (_match, separator, quote) => {
        const safeQuote = quote || '';
        return `stroke${separator}${safeQuote}#FFFFFF${safeQuote}`;
      },
    );

    output = output.replace(
      /(<rect[^>]*?fill=)(['"]?)#FFFFFF\2/i,
      (_match, prefix, quote) => {
        const safeQuote = quote || '';
        return `${prefix}${safeQuote}#000000${safeQuote}`;
      },
    );
  }

  return output;
};

const MolViewer2D = ({
  smile,
  cation,
  theme = 'light',
  width = DEFAULT_DIMENSION,
  height = DEFAULT_DIMENSION,
  className,
  style,
  ...rest
}) => {
  const [svgMarkup, setSvgMarkup] = useState('');
  const [renderState, setRenderState] = useState({ status: 'idle', error: null });

  const smilesToDraw = useMemo(
    () => formatSmilesWithCation(smile, cation),
    [smile, cation],
  );

  const cacheKey = useMemo(() => {
    if (!smilesToDraw) return null;
    return `${smilesToDraw}|${theme}|${width}x${height}`;
  }, [smilesToDraw, theme, width, height]);

  useEffect(() => {
    if (!smilesToDraw) {
      setSvgMarkup('');
      setRenderState({ status: 'idle', error: null });
      return () => {};
    }

    let cancelled = false;

    const cached = cacheKey ? promoteCacheEntry(cacheKey) : null;
    if (cached?.status === 'resolved') {
      setSvgMarkup(cached.value);
      setRenderState({ status: 'ready', error: null });
      return () => {
        cancelled = true;
      };
    }

    setRenderState({ status: 'loading', error: null });

    const draw = async () => {
      try {
        const svg = await getCachedSvg(cacheKey, async () => {
          const RDKit = await loadRDKit();
          const mol = RDKit.get_mol(smilesToDraw);

          if (!mol) {
            throw new Error('Unable to parse SMILES for rendering');
          }

          try {
            let svgMarkupResult = null;

            if (theme === 'dark' && typeof mol.get_svg_with_highlights === 'function') {
              svgMarkupResult = mol.get_svg_with_highlights(
                JSON.stringify({
                  width,
                  height,
                  clearBackground: false,
                  backgroundColour: [0, 0, 0],
                }),
              );
            }

            if (!svgMarkupResult && typeof mol.get_svg === 'function') {
              svgMarkupResult = mol.get_svg(width, height);
            }

            if (!svgMarkupResult) {
              throw new Error('RDKit did not return SVG content');
            }

            return sanitizeSvg(svgMarkupResult, theme);
          } finally {
            if (typeof mol.delete === 'function') {
              try {
                mol.delete();
              } catch (error) {
                console.warn('Failed to dispose RDKit molecule instance', error);
              }
            }
          }
        });

        if (!cancelled) {
          setSvgMarkup(svg);
          setRenderState({ status: 'ready', error: null });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to render molecule with RDKit', error);
          setSvgMarkup('');
          setRenderState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unable to render molecule',
          });
        }
      }
    };

    draw();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, height, smilesToDraw, theme, width]);

  const containerStyle = {
    width,
    height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    ...style,
  };

  const ariaLabel = smilesToDraw ? `Molecule for SMILES string ${smilesToDraw}` : 'Molecule thumbnail';

  return (
    <div
      id="smiles-image-popup"
      className={className}
      style={containerStyle}
      role="img"
      aria-label={ariaLabel}
      aria-live="polite"
      {...rest}
    >
      {svgMarkup ? (
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : renderState.status === 'loading' ? (
        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Rendering…</span>
      ) : renderState.status === 'error' ? (
        <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>Unable to render molecule</span>
      ) : null}
    </div>
  );
};

export default MolViewer2D;
