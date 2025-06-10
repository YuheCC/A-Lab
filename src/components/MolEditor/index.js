import { Kekule } from 'kekule';
import 'kekule/theme/default'; 
import './MolEditor.css';
import { useEffect, useRef, useState } from 'react';

const MolEditor = ({ onMolChange }) => {
    const [composer, setComposer] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const composer = new Kekule.Editor.Composer(editorRef.current)
            .setCommonToolButtons(['newDoc', 'undo', 'redo', 'zoomIn', 'zoomOut'])
            .setChemToolButtons(['manipulate', 'erase', 'bond', 'atomAndFormula', 'ring', 'charge'])
            .setDimension('100%', '300px');

        const handleMolChange = (event) => {
            try {
                const mol = composer.getChemObj();
                if (!mol) return;
                const smiles = Kekule.IO.saveMimeData(mol, 'chemical/x-daylight-smiles');
                onMolChange(smiles);
                console.log('Molecule changed:', smiles);
            } catch (error) {
                console.error('Error processing molecule change:', error);
            }
        };
        
        composer.addEventListener('operChange', handleMolChange);

        setComposer(composer);

        return () => {
            if (composer) {
                composer.removeEventListener('operChange', handleMolChange);
            }
        };

    }, [])

    return (<div ref={editorRef} className='mol-editor'></div>);
};

export default MolEditor;