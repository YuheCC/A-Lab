import { create } from 'zustand';
import { Navigate, useLocation } from 'umi';
import { useEffect } from 'react';
import { login as loginService, register as registerService, verify as verifyService, verifyCode as verifyCodeService, verifyForgotPasswordCode as verifyForgotPasswordCodeService } from '@/services/auth';

interface AuthState {
    initialAuthLoaded: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    userPermissions: string | null;
    userName: string | null;
    token: string | null;
    error: string | null;
    userInfo: any | null;
    login: (data: { username: string, password: string }) => Promise<{ success: boolean, error?: string | undefined, data?: any }>;
    register: (data: { username: string, email: string, first_name: string, last_name: string, organization_name: string, password: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    verifyCode: (data: { verify_id: string, code: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    verifyForgotPassword: (data: { verify_id: string, code: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    logout: () => Promise<void>;
    verifyAuth: () => Promise<void>;
    hasPermission: (permissionsList?: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({

    initialAuthLoaded: false,
    isLoading: false,
    isAuthenticated: false,
    userPermissions: null,
    userName: null,
    token: null,
    error: null,
    userInfo: {},
    verifyAuth: async () => {
        const token = localStorage.getItem('token');
        const permissions = localStorage.getItem('permissions') || '';
        set({ userPermissions: permissions, isLoading: true });

        if (!token) {
            set({
                isLoading: false,
                isAuthenticated: false,
                initialAuthLoaded: true,
            });
            const current = window.location.pathname + window.location.search;
            localStorage.setItem('redirectAfterLogin', current);
            if(window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login?redirect=' + encodeURIComponent(current);
            }
            return;
        }

        try {
            const response: any = await verifyService();
            const data = response.data;

            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions || 'research');

            set({
                isAuthenticated: true,
                userName: data.username,
                userPermissions: data.permissions || 'research',
                isLoading: false,
                initialAuthLoaded: true,
                userInfo: data
            });
        } catch (err) {
            console.error('Auth verification error:', err);
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
    },

    login: async ({ username, password }: { username: string, password: string }) => {
        set({ isLoading: true });
        try {   

            const response: any = await loginService({ username, password });
            const data = response.data;

            set({
                isAuthenticated: true,
                isLoading: false,
                token: data.access_token,
                userName: data.username,
                userPermissions: data.permissions || '',
                userInfo: data
            });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions);

            return { success: response?.ok !== false, data: data, message: data.message || data.detail || "" };
            
        } catch (error) {
            const errorMessage = (error as any)?.detail || 'Authentication failed';
            set({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage }
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
        const current = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', current);
        window.location.href = '/login?redirect=' + encodeURIComponent(current);
    },

    register: async ({ username, email, first_name, last_name, organization_name, password }: { username: string, email: string, first_name: string, last_name: string, organization_name: string, password: string }) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await registerService({ username, email, first_name, last_name, organization_name, password });
            const data = response.data;
            console.log(response)
            set({
                isLoading: false,
                error: null,
            })

            return { success: response?.ok !== false, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.detail || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage }
        }
    },

    verifyCode: async ({ verify_id, code }: { verify_id: string, code: string }) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await verifyCodeService({ verify_id, code });
            const data = response.data;

            set({
                isLoading: false,
                error: null,
            })

            return { success: response?.ok !== false, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.detail || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage }
        }
    },

    verifyForgotPassword: async ({ verify_id, code }: { verify_id: string, code: string }) => {
        set({ isLoading: true, error: null });
        try {
            const response: any = await verifyForgotPasswordCodeService({ verify_id, code });
            const data = response.data;

            set({
                isLoading: false,
                error: null,
            })

            return { success: response?.ok !== false, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.detail || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage }
        }
    },

    hasPermission: (permissionsList?: string[]) => {
        if (!Array.isArray(permissionsList)) throw new Error("hasPermission expects an array of accepted user roles.");

        const { userPermissions } = get();
        return userPermissions ? permissionsList.includes(userPermissions) : false;
    }
}))

export const ProtectedRoute = ({ children, allowedRoles = [] }: { children: React.ReactNode, allowedRoles: string[] }) => {

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