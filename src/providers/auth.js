import { create } from 'zustand';
import { authFetch, getAPIUrl } from '../utils';
import { Navigate, useLocation } from 'react-router';
import { useEffect } from 'react';

const API_URL = getAPIUrl();

export const useAuthStore = create((set, get) => ({

    initialAuthLoaded: false,
    isLoading: false,
    isAuthenticated: false,
    userPermissions: null,
    userName: null,
    token: null,
    error: null,

    verifyAuth: async () => {
        const token = localStorage.getItem('token');
        const permissions = localStorage.getItem('permissions') || 'research';
        set({ userPermissions: permissions, isLoading: true });

        if (!token) {
            set({
                isLoading: false,
                isAuthenticated: false,
                initialAuthLoaded: true,
            });
            return;
        }

        try {
            const response = await authFetch(`${API_URL}/verify-token`);

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('username', data.username);
                localStorage.setItem('permissions', data.permissions || 'research');

                set({
                    isAuthenticated: true,
                    userName: data.username,
                    userPermissions: data.permissions || 'research',
                    isLoading: false,
                    initialAuthLoaded: true
                });
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('permissions');
                set({
                    isAuthenticated: false,
                    userPermissions: 'research',
                    isLoading: false,
                    initialAuthLoaded: true,
                })
            }
        } catch (err) {
            console.error('Auth verification error:', err);
            set({
                isAuthenticated: false,
                userPermissions: 'research',
                isLoading: false,
                initialAuthLoaded: true,
            })
        }
    },

    login: async ({ username, password }) => {
        set({ isLoading: true });
        try {
            const formData = new FormData();

            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                body: formData,
            });

            // --- richer error handling ---
            if (!response.ok) {
                let errorMsg = 'Authentication failed';
                try {
                    // Most FastAPI errors are JSON { detail: "…" }
                    const dataErr = await response.clone().json();
                    if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
                } catch {
                    try {
                        // Fallback: plain‑text body
                        const textErr = await response.text();
                        if (textErr) errorMsg = textErr;
                    } catch { /* ignore */ }
                }
                set({ isLoading: false, error: errorMsg })
                return { success: false, error: errorMsg }
            }

            const data = await response.json();

            set({
                isAuthenticated: true,
                isLoading: false,
                token: data.access_token,
                userName: data.username,
                userPermissions: data.permissions || 'research',
            });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions);

            return { success: true };
            
        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error}
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('permissions');
        set({ 
            isAuthenticated: false, 
            token: null, 
            userPermissions: null, 
            userName: null,
            isLoading: false,
            error: null
        });
        window.location.href = '/'; // Redirect to login page
    },

    register: async ({ username, email, first_name, last_name, organization_name }) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('username', username)
            formData.append('email', email);
            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            formData.append('organization_name', organization_name);

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                body: formData,
            });

            // --- richer error handling ---
            if (!response.ok) {
                let errorMsg = 'Authentication failed';
                try {
                    // Most FastAPI errors are JSON { detail: "…" }
                    const dataErr = await response.clone().json();
                    if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
                } catch {
                    try {
                        // Fallback: plain‑text body
                        const textErr = await response.text();
                        if (textErr) errorMsg = textErr;
                    } catch { /* ignore */ }
                }
                set({ isLoading: false, error: errorMsg })
                return { success: false, error: errorMsg }
            }

            const data = await response.json();
            console.log('response', data);

            set({
                isLoading: false,
                error: null,
            })

            return { success: true, message: data.message };

        } catch (error) {
            const errorMessage = error.message || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage }
        }
    },

    hasPermission: (permissionsList) => {
        if (!Array.isArray(permissionsList)) throw new Error("hasPermission expects an array of accepted user roles.");

        const { userPermissions } = get();
        return permissionsList.includes(userPermissions);
    }
}))

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {

    const { pathname } = useLocation();
    const { hasPermission, isAuthenticated, isLoading, initialAuthLoaded, verifyAuth } = useAuthStore();

    useEffect(() => {
        verifyAuth();
    }, [pathname]);

    // If auth is loading show auth loading state
    if (isLoading || !initialAuthLoaded) {
        return <div className="app-loading">Loading...</div>;
    }

    // If the user is not authenticated (this page is protected), redirec to auth
    if (!isAuthenticated) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(pathname)}`}></Navigate>
    }

    // If the user is authenticated and there are no allowedRoles default to allowing all authenticated users
    if (isAuthenticated && allowedRoles.length === 0) {
        return children;
    }

    // If roles specified, verify user has appropriate roles otherwise redirect to unauthorized page
    if (isAuthenticated && !hasPermission(allowedRoles)) {
        return <Navigate to="/unauthorized" state={{ from: pathname }}></Navigate>
    }

    return children;
};