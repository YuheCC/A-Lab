import { useEffect, useMemo, useRef } from 'react';
import SmilesDrawer from 'smiles-drawer';

const MolViewer2D = ({ smile, theme = "light" }) => {
    const imageRef = useRef(null);
    const sd = useMemo(() => new SmilesDrawer.SmiDrawer({ 
        width: 400, height: 400,
        compactDrawing: false,
        terminalCarbons: true,
    }, {}), []);

    useEffect(() => {
        sd.draw(smile, imageRef.current, theme, false);
    }, [smile, sd, theme])

    return (
        <svg id="smiles-image-popup" ref={imageRef} width={200} height={200} alt={`Molecule for smile string: ${smile}`} style={{
            maxWidth: '100%',
        }} />
    )
};

export default MolViewer2D;