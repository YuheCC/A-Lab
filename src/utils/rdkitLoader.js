import initRDKitModule from '@rdkit/rdkit';

let rdkitModulePromise = null;

const ensureTrailingSlash = (value) => {
  if (!value) return '/';
  return value.endsWith('/') ? value : `${value}/`;
};

const getBasePath = () => {
  if (typeof window === 'undefined') return '/';
  const baseHref = typeof document !== 'undefined'
    ? document.querySelector('base')?.getAttribute('href')
    : null;

  const candidates = [
    window.__UMI_PUBLIC_PATH__,
    window.publicPath,
    window.routerBase,
    baseHref,
  ];

  const found = candidates.find((entry) => typeof entry === 'string' && entry.length > 0);
  if (!found) return '/';

  try {
    const url = new URL(found, window.location.origin);
    return ensureTrailingSlash(url.pathname || '/');
  } catch (error) {
    return ensureTrailingSlash(found);
  }
};

export const loadRDKit = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('RDKit is only available in browser environments.'));
  }

  if (window.__RDKitModule) {
    return Promise.resolve(window.__RDKitModule);
  }

  if (!rdkitModulePromise) {
    const basePath = ensureTrailingSlash(getBasePath());
    rdkitModulePromise = initRDKitModule({
      locateFile: (file) => `${basePath}rdkit/${file}`,
    })
      .then((module) => {
        window.__RDKitModule = module;
        return module;
      })
      .catch((error) => {
        rdkitModulePromise = null;
        throw error;
      });
  }

  return rdkitModulePromise;
};
