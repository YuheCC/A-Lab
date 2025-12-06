import { Kekule } from 'kekule';
import 'kekule/theme/default';
import './MolEditor.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AtomIcon, Download } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import { useTranslation } from 'react-i18next';
import { loadRDKit } from '@/utils/rdkitLoader';
import { authFetch, getAPIUrl } from '@/utils';

const API_URL = getAPIUrl();
const SEARCH_ENDPOINT = `${API_URL}/api/search/search-new`;

const MolEditor = ({ onMolChange, style, getSmilesForImport }) => {
    const [focused, setFocused] = useState(false);
    const [composer, setComposer] = useState(null);
    const [importing, setImporting] = useState(false);
    const [bannerMessage, setBannerMessage] = useState(null);
    const editorRef = useRef(null);
    const rdkitModuleRef = useRef(null);
    const rdkitLoadPromiseRef = useRef(null);
    const bannerTimerRef = useRef(null);
    const { t } = useTranslation();

    const extractSmilesCandidates = (rawInput) => {
        if (!rawInput) return [];

        const trimmedInput = rawInput.trim();
        if (!trimmedInput) return [];

        const seen = new Set();
        const candidates = [];

        const pushCandidate = (value, includeSanitized = true) => {
            if (!value) return;
            let token = value.trim();
            if (!token) return;
            token = token.replace(/^["'`]+|["'`]+$/g, '');
            if (!token) return;
            if (!seen.has(token)) {
                candidates.push(token);
                seen.add(token);
            }
            if (includeSanitized && /\s/.test(token)) {
                const collapsed = token.replace(/\s+/g, '');
                if (collapsed && !seen.has(collapsed)) {
                    candidates.push(collapsed);
                    seen.add(collapsed);
                }
            }
        };

        pushCandidate(trimmedInput);

        const separators = /[\n,;\uFF0C\u3001]/;
        if (separators.test(trimmedInput)) {
            trimmedInput
                .split(separators)
                .forEach((part) => pushCandidate(part));
        }

        if (!separators.test(trimmedInput) && trimmedInput.includes(' ')) {
            trimmedInput
                .split(' ')
                .forEach((part) => pushCandidate(part, false));
        }

        return candidates;
    };

    const ensureRdkitModule = async () => {
        if (rdkitModuleRef.current) {
            return rdkitModuleRef.current;
        }

        if (!rdkitLoadPromiseRef.current) {
            rdkitLoadPromiseRef.current = loadRDKit()
                .then((module) => {
                    rdkitModuleRef.current = module;
                    console.log('[MolEditor] RDKit module loaded.');
                    return module;
                })
                .catch((error) => {
                    console.error('[MolEditor] Failed to load RDKit module.', error);
                    rdkitLoadPromiseRef.current = null;
                    return null;
                });
        }

        return rdkitLoadPromiseRef.current;
    };

    useEffect(() => {
        ensureRdkitModule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tryLoadSmiles = async (candidate) => {
        if (!candidate || !composer) return false;

        const RDKit = await ensureRdkitModule();
        if (!RDKit) {
            console.warn('[MolEditor] RDKit module unavailable; cannot import SMILES.');
            return false;
        }

        let mol = null;
        let molBlock = null;
        try {
            mol = RDKit.get_mol(candidate);
            if (!mol) {
                console.warn('[MolEditor] RDKit returned null for SMILES candidate.');
                return false;
            }
            molBlock = mol.get_molblock();
            console.log('[MolEditor] RDKit generated MolBlock from SMILES candidate.');
        } catch (rdkitError) {
            console.warn('[MolEditor] RDKit failed to parse SMILES candidate:', candidate, rdkitError);
            try {
                mol?.delete?.();
            } catch (cleanupError) {
                console.warn('[MolEditor] RDKit molecule cleanup failed after parse error.', cleanupError);
            }
            return false;
        } finally {
            try {
                mol?.delete?.();
            } catch (cleanupError) {
                console.warn('[MolEditor] RDKit molecule cleanup failed.', cleanupError);
            }
        }

        const originalHandler = Kekule.exceptionHandler;
        const baseHandler = Kekule.ExceptionHandler && Kekule.ExceptionHandler.getInstance
            ? Kekule.ExceptionHandler.getInstance()
            : originalHandler;

        try {
            if (baseHandler && originalHandler !== baseHandler) {
                Kekule.exceptionHandler = baseHandler;
            }
            console.log('[MolEditor] Attempting to load MolBlock into composer.');
            const chemObj = Kekule.IO.loadFormatData(molBlock, 'mol');
            if (!chemObj) {
                console.log('[MolEditor] Failed to parse SMILES candidate (no chem object returned).');
                return false;
            }
            console.log('[MolEditor] Parsed candidate into chem object:', {
                className: chemObj?.getClass?.(),
                nodeCount: chemObj?.getNodeCount?.(),
                connectorCount: chemObj?.getConnectorCount?.(),
            });
            composer.load(chemObj);
            const loadedObj = composer.getChemObj();
            console.log('[MolEditor] Composer load invoked. Current chem object summary:', {
                exists: !!loadedObj,
                className: loadedObj?.getClass?.(),
                nodeCount: loadedObj?.getNodeCount?.(),
                connectorCount: loadedObj?.getConnectorCount?.(),
            });

            if (typeof onMolChange === 'function') {
                try {
                    const smiles = Kekule.IO.saveMimeData(chemObj, 'chemical/x-daylight-smiles');
                    if (smiles) {
                        console.log('[MolEditor] Emitting onMolChange with SMILES:', smiles);
                        onMolChange(smiles);
                    }
                } catch (saveError) {
                    console.error('Failed to sync SMILES after import:', saveError);
                }
            }

            if (typeof composer.repaint === 'function') {
                composer.repaint();
            }
            console.log('[MolEditor] SMILES import succeeded for candidate.');
            return true;
        } catch (error) {
            console.warn('[MolEditor] Error while loading MolBlock derived from SMILES candidate:', candidate, error);
            return false;
        } finally {
            Kekule.exceptionHandler = originalHandler;
        }
    };

    const hideBanner = useCallback(() => {
        if (bannerTimerRef.current) {
            clearTimeout(bannerTimerRef.current);
            bannerTimerRef.current = null;
        }
        setBannerMessage(null);
    }, []);

    const showBanner = useCallback((message) => {
        if (!message) return;
        hideBanner();
        setBannerMessage(message);
        bannerTimerRef.current = setTimeout(() => {
            setBannerMessage(null);
            bannerTimerRef.current = null;
        }, 4000);
    }, [hideBanner]);

    useEffect(() => () => {
        if (bannerTimerRef.current) {
            clearTimeout(bannerTimerRef.current);
        }
    }, []);

    const fetchSmilesFromSearch = useCallback(async (query) => {
        const normalizedQuery = typeof query === 'string' ? query.trim() : '';
        if (!normalizedQuery) {
            return null;
        }

        try {
            const response = await authFetch(`${SEARCH_ENDPOINT}?query=${encodeURIComponent(normalizedQuery)}&umap_type=organic`);
            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            const envelopes = Array.isArray(data) ? data : [data];

            for (const env of envelopes) {
                if (!env || env.message === 'Ambiguous molecule abbreviation') {
                    continue;
                }

                if (env.found && Array.isArray(env.molecule_details)) {
                    for (const detail of env.molecule_details) {
                        const smiles = detail?.SMILES || detail?.smiles;
                        if (smiles) {
                            return smiles;
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('[MolEditor] Search fallback failed for query:', normalizedQuery, error);
        }

        return null;
    }, []);

    const handleImportClick = async () => {
        if (!composer || typeof getSmilesForImport !== 'function' || importing) {
            return;
        }

        setImporting(true);
        hideBanner();

        try {
            const rawInput = getSmilesForImport();
            const candidates = extractSmilesCandidates(rawInput);
            console.log('[MolEditor] Import button clicked.', { rawInput, candidates, candidateCount: candidates.length });

            if (!candidates.length) {
                console.warn('[MolEditor] No SMILES candidates available from input.');
            }

            for (const candidate of candidates) {
                // eslint-disable-next-line no-await-in-loop
                const success = await tryLoadSmiles(candidate);
                if (success) {
                    console.log('[MolEditor] Import completed using candidate:', candidate);
                    hideBanner();
                    return;
                }
            }

            console.warn('[MolEditor] Unable to import any SMILES candidates from direct input. Attempting search fallback.');
            const uniqueQueries = Array.from(new Set([
                typeof rawInput === 'string' ? rawInput : '',
                ...candidates,
            ]));

            for (const query of uniqueQueries) {
                // eslint-disable-next-line no-await-in-loop
                const fallbackSmiles = await fetchSmilesFromSearch(query);
                if (!fallbackSmiles) {
                    continue;
                }

                console.log('[MolEditor] Search fallback produced SMILES candidate:', fallbackSmiles);
                // eslint-disable-next-line no-await-in-loop
                const success = await tryLoadSmiles(fallbackSmiles);
                if (success) {
                    hideBanner();
                    return;
                }
            }

            console.warn('[MolEditor] Search fallback was unable to provide a renderable SMILES.');
            showBanner(t('search.importSmilesErrorBanner', 'We couldn\'t render that molecule. Try a different SMILES or molecule name.'));
        } finally {
            setImporting(false);
        }
    };

    const importTooltip = t('search.importSmilesTooltip', 'Import SMILES to drawing tool.');

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
        console.log('[MolEditor] Composer initialized.');

        const handleMolChange = (event) => {
            try {
                const mol = composer.getChemObj();
                if (!mol) return;
                const smiles = Kekule.IO.saveMimeData(mol, 'chemical/x-daylight-smiles');
                console.log('[MolEditor] Composer change detected. Current SMILES:', smiles);
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
        <div className='mol-editor-toolbar'>
            <InfoTooltip title={importTooltip} placement="top">
                <button
                    type='button'
                    className='mol-editor-import-button'
                    onClick={handleImportClick}
                    disabled={importing}
                    aria-label={importTooltip}
                >
                    <Download size={18} />
                </button>
            </InfoTooltip>
        </div>
        {bannerMessage && (
            <div className='mol-editor-banner' role='status'>
                {bannerMessage}
            </div>
        )}
        <div ref={editorRef} className='mol-editor' id='kekule-editor'></div>
        <div className='tips'>If you need to modify the atoms at the corners use the <AtomIcon size={14} style={{
            marginLeft: 5,
            marginRight: 5
        }} /> Atom Tool and click on the atoms.</div>
    </div>);
};

export default MolEditor;
