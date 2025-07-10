export const getAPIUrl = () => process.env.REACT_APP_API_URL || 'https://api-sh.ses.ai';

const API_URL = getAPIUrl();

// Commercial score map for displaying the commercial viability of compounds
export const COMMERCIAL_SCORE_MAP = {
  0: 'Requires R&D to assess viability',
  1: 'Likely synthesizable but probably not commercially available',
  2: 'Likely synthesizable, may be commercially available',
  3: 'Likely commercially available'
}

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

  // Store the current URL to redirect back after login
  localStorage.setItem('redirectAfterLogin', current);

  // Send them to the sign‑in screen **once**, carrying the original target.
  window.history.pushState(
    {},
    '',
    `/login?redirect=${encodeURIComponent(current)}`,
  );
  window.location.reload();
};


// Labels for filters
export const filterLabels = {
    molwt: "Molecular Weight",
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
    chemical_formula: "Chemical Formula"
};