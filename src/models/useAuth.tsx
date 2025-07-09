import { create } from 'zustand';
import { Navigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { login as loginService, register as registerService, verify as verifyService } from '@/services/auth';

interface AuthState {
    initialAuthLoaded: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    userPermissions: string | null;
    userName: string | null;
    token: string | null;
    error: string | null;
    login: (data: { username: string, password: string }) => Promise<{ success: boolean, error?: string | undefined }>;
    register: (data: { username: string, email: string, first_name: string, last_name: string, organization_name: string }) => Promise<void>;
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
            const data: any = await verifyService();

            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions || 'research');

            set({
                isAuthenticated: true,
                userName: data.username,
                userPermissions: data.permissions || 'research',
                isLoading: false,
                initialAuthLoaded: true
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

            const data: any = await loginService({ username, password });
            console.log(data)
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
        window.location.href = '/'; // Redirect to login page
    },

    register: async ({ username, email, first_name, last_name, organization_name }: { username: string, email: string, first_name: string, last_name: string, organization_name: string }) => {
        set({ isLoading: true, error: null });
        try {
            const data: any = await registerService({ username, email, first_name, last_name, organization_name });
            console.log('response', data);

            set({
                isLoading: false,
                error: null,
            })

            return { success: true, message: data.message };

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