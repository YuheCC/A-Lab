import { useEffect, useMemo, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';
import { formatSmilesWithCation } from '@/utils';

const MolViewer2D = ({ smile, theme = "light", cation }) => {
    const imageRef = useRef(null);
    const sd = useMemo(() => new SmilesDrawer.SmiDrawer({
        width: 400, height: 400,
        compactDrawing: false,
        terminalCarbons: true,
    }, {}), []);

    const smilesToDraw = useMemo(() => formatSmilesWithCation(smile, cation), [smile, cation]);

    useEffect(() => {
        if (!smilesToDraw || !imageRef.current) return;
        sd.draw(smilesToDraw, imageRef.current, theme, false);
    }, [smilesToDraw, sd, theme])

    return (
        <svg id="smiles-image-popup" ref={imageRef} width={200} height={200} alt={`Molecule for smile string: ${smilesToDraw || smile}`} style={{
            maxWidth: '100%',
        }} />
    )
};

export default MolViewer2D;