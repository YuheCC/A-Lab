import { triggerLoginModal, shouldShowLoginModal, triggerPricingModal } from './utils/authHelpers';

export const getAPIUrl = () => BASE_URL || 'https://prod-api.ses.ai';

const API_URL = getAPIUrl();

// Commercial score map for displaying the commercial viability of compounds
export const COMMERCIAL_SCORE_MAP = {
  0: 'Requires R&D to assess viability',
  1: 'Likely synthesizable but probably not commercially available',
  2: 'Likely synthesizable, may be commercially available',
  3: 'Commercially available'
}

/**
 * Append a cation to the beginning of a SMILES string when needed so that
 * molecule renderers show the full ionic pair. The backend may sometimes
 * return the cation separately; this helper normalises the output.
 *
 * @param {string} smiles Base SMILES string returned from the API.
 * @param {string | null | undefined} cation Optional cation symbol such as `Li+`.
 * @returns {string} SMILES string with the cation prefixed when provided.
 */
export const formatSmilesWithCation = (smiles, cation) => {
  if (!smiles || typeof smiles !== 'string') return smiles;
  if (!cation) return smiles;

  const trimmed = String(cation).trim();
  if (!trimmed) return smiles;

  const bracketed = trimmed.startsWith('[') ? trimmed : `[${trimmed}]`;
  const segments = smiles.split('.');
  if (segments.some(segment => segment.trim() === bracketed)) {
    return smiles;
  }

  return `${bracketed}.${smiles}`;
};

/**
 * Fetch wrapper that automatically attaches JWT to all requests
 * going to our backend. Also handles 401 responses by redirecting
 * to the login page.
 * @param {*} input
 * @param {*} init 
 * @returns 
 */
export const authFetch = (input, init = {}) => {
  // -------------------------------------------------------------------
  // 1) Transparently attach JWT to **any** request going to our backend
  //    so that all parts of the app stay authenticated even when they
  //    use plain `fetch()` instead of `authFetch()`.
  // -------------------------------------------------------------------
  const token = localStorage.getItem('token');
  let url = typeof input === 'string' ? input : input?.url || '';

  // Treat bare " /api"‑style paths as same‑origin
  const sameOrigin = url.startsWith('/') && !url.startsWith('//');
  const isBackend = url.startsWith(API_URL) || sameOrigin;

  if (token && isBackend) {
    // Normalise existing headers then merge
    const hdrs = new Headers(init.headers || {});
    if (!hdrs.has('Authorization')) {
      hdrs.set('Authorization', `Bearer ${token}`);
    }
    init = { ...init, headers: hdrs };
  }

  // -------------------------------------------------------------------
  // 2) Perform the request
  // -------------------------------------------------------------------
  return fetch(input, init).then((response) => {
    // 401? → log the user out **unless** we're on an auth page already
    if (
      response.status === 401 &&
      !/^\/(login|signin|reset-password)/.test(window.location.pathname)
    ) {
      redirectToLogin();
    }
    // 402? → show pricing overlay (but not for GET requests)
    const method = (init.method || 'GET').toUpperCase();
    if (response.status === 402 && method !== 'GET') {
      // Try to get permission info from response
      response.clone().json().then((data) => {
        const permission = data?.required_permission || null;
        triggerPricingModal(permission);
      }).catch(() => {
        // If JSON parsing fails, just show pricing modal without permission
        triggerPricingModal(null);
      });
    }
    return response;
  });
};

// ---------------------------------------------------------------------------
// Global fetch wrapper that (1) attaches JWT to backend requests and (2) logs the user out on 401 Unauthorized responses
export const redirectToLogin = () => {
  // Already on an auth route?   → do **nothing** to avoid redirect loops.
  if (/^\/(login|reset-password)/.test(window.location.pathname)) return;

  const current = window.location.pathname + window.location.search;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('permissions');
  localStorage.removeItem('organization_name');

  // Store the current URL to redirect back after login
  localStorage.setItem('redirectAfterLogin', current);

  // 使用登录浮层而不是页面跳转
  if (shouldShowLoginModal(window.location.pathname)) {
    triggerLoginModal(current);
  } else {
    // 如果不应该显示浮层（比如在首页），则跳转到登录页面
    window.history.pushState(
      {},
      '',
      `/login?redirect=${encodeURIComponent(current)}`,
    );
    window.location.reload();
  }
};


// Labels for filters
export const filterLabels = {
    molwt: "Molecular Weight（g/mol ）",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)",
    predicted_mp: "Predicted Melting Point (°C)",
    predicted_bp: "Predicted Boiling Point (°C)",
    predicted_fp: "Predicted Flash Point (°C)",
    combustion_enthalpy: "Combustion Enthalpy (eV)",
    commercial_score: "Commercial Viability",
    CLUSTER: "Cluster",
    functional_groups: "Functional Groups",
    chemical_formula: "Chemical Formula",
    vdw_volume_angstroms3: "Molecular Volume（Å³）",
    fluoride_bde_ev: "F Dissociation Energy（eV）"
};