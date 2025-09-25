import { useEffect, useMemo, useState } from 'react';
import { formatSmilesWithCation } from '@/utils';
import { loadRDKit } from '@/utils/rdkitLoader';

const DEFAULT_DIMENSION = 200;

const sanitizeSvg = (svg, theme) => {
  if (!svg) return '';
  let output = svg.replace(/<\?xml[^>]*>/i, '').trim();

  if (theme === 'dark') {
    output = output.replace(
      /(stroke|fill)([:=])(['"]?)#000000\3/gi,
      (_match, attribute, separator, quote) => {
        const safeQuote = quote || '';
        return `${attribute}${separator}${safeQuote}#FFFFFF${safeQuote}`;
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

  useEffect(() => {
    let cancelled = false;
    let mol = null;
    let disposed = false;

    const disposeMol = () => {
      if (!mol || disposed) return;
      const destroy = typeof mol.delete === 'function' ? mol.delete.bind(mol) : null;
      if (!destroy) {
        mol = null;
        disposed = true;
        return;
      }

      try {
        destroy();
      } catch (error) {
        console.warn('Failed to dispose RDKit molecule instance', error);
      } finally {
        mol = null;
        disposed = true;
      }
    };

    const draw = async () => {
      if (!smilesToDraw) {
        setSvgMarkup('');
        setRenderState({ status: 'idle', error: null });
        return;
      }

      setRenderState({ status: 'loading', error: null });

      try {
        const RDKit = await loadRDKit();
        if (cancelled) return;

        mol = RDKit.get_mol(smilesToDraw);
        if (!mol) {
          throw new Error('Unable to parse SMILES for rendering');
        }

        const drawOptions = {
          width,
          height,
          clearBackground: theme !== 'dark',
        };

        if (theme === 'dark') {
          drawOptions.backgroundColour = [0, 0, 0];
        }

        let svg = null;

        if (typeof mol.get_svg_with_highlights === 'function') {
          svg = mol.get_svg_with_highlights(JSON.stringify(drawOptions));
        }

        if (!svg && typeof mol.get_svg === 'function') {
          svg = mol.get_svg(width, height);
        }

        if (!svg) {
          throw new Error('RDKit did not return SVG content');
        }

        if (!cancelled) {
          setSvgMarkup(sanitizeSvg(svg, theme));
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
      } finally {
        disposeMol();
      }
    };

    draw();

    return () => {
      cancelled = true;
      disposeMol();
    };
  }, [height, smilesToDraw, theme, width]);

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
