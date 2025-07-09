import { Kekule } from 'kekule';
import 'kekule/theme/default';
import './MolEditor.css';
import { useEffect, useRef, useState } from 'react';
import { AtomIcon } from 'lucide-react';

const MolEditor = ({ onMolChange, style }) => {
    const [focused, setFocused] = useState(false);
    const [composer, setComposer] = useState(null);
    const editorRef = useRef(null);

    const handleKeyDown = (event) => {
        if (focused) {
            // Handle undo
            if (event.shiftKey && (
                (event.ctrlKey && event.key === 'z') ||
                (event.metaKey && event.key === 'z' && !event.altKey)
            )) {
                event.preventDefault();
                composer?.redo();
            } else if ((event.ctrlKey && event.key === 'z') || (event.metaKey && event.key === 'z')) {
                event.preventDefault();
                composer?.undo();
            }
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    })

    const onMouseEnter = (e) => {
        setFocused(true);

    }

    const onMouseLeave = (e) => {
        setFocused(false);
    }

    useEffect(() => {
        if (!editorRef.current) return;

        const composer = new Kekule.Editor.Composer(editorRef.current)
            .setCommonToolButtons(['newDoc', 'undo', 'redo', 'zoomIn', 'zoomOut'])
            .setChemToolButtons(['manipulate', 'erase', 'bond', 'atomAndFormula', 'ring', 'charge'])
            .setEnableLoadNewFile(false)
            .setAllowCreateNewChild(false)
            .setDimension('100%', '300px');

        const handleMolChange = (event) => {
            try {
                const mol = composer.getChemObj();
                if (!mol) return;
                const smiles = Kekule.IO.saveMimeData(mol, 'chemical/x-daylight-smiles');
                onMolChange(smiles);
            } catch (error) {
                console.error('Error processing molecule change:', error);
            }
        };

        composer.addEventListener('endUpdateObject', handleMolChange);

        setComposer(composer);

        return () => {
            if (composer) {
                composer.removeEventListener('endUpdateObject', handleMolChange);
            }
        };

    }, [])

    return (<div className={`mol-editor-container ${focused ? 'focused' : ''}`} style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <div ref={editorRef} className='mol-editor' id='kekule-editor'></div>
        <div className='tips'>If you need to modify the atoms at the corners use the <AtomIcon size={14} style={{
            marginLeft: 5,
            marginRight: 5
        }} /> Atom Tool and click on the atoms.</div>
    </div>);
};

export default MolEditor;