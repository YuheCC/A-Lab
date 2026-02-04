import { create } from 'zustand';
import { Navigate, useLocation } from 'umi';
import { useEffect } from 'react';
import { login as loginService, register as registerService, verify as verifyService, verifyCode as verifyCodeService, verifyForgotPasswordCode as verifyForgotPasswordCodeService } from '@/services/auth';
import { triggerLoginModal, shouldShowLoginModal } from '@/utils/authHelpers';

interface AuthState {
    initialAuthLoaded: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    userPermissions: string | null;
    permissionsNew: string[];
    userName: string | null;
    token: string | null;
    error: string | null;
    userInfo: any | null;
    isAdvancedTier: boolean;
    organization_name: string | null;
    login: (data: { username: string, password: string }) => Promise<{ success: boolean, error?: string | undefined, message?: string, data?: any }>;
    register: (data: { username: string, email: string, first_name: string, last_name: string, organization_name: string, password: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    verifyCode: (data: { verify_id: string, code: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    verifyForgotPassword: (data: { verify_id: string, code: string }) => Promise<{ success: boolean, message?: any, error?: string, data?: any }>;
    logout: () => Promise<void>;
    verifyAuth: () => Promise<void>;
    hasPermission: (permissionsList?: string[]) => boolean;
    hasPermissionNew: (permission: string) => boolean;
}

// 解析 permissions_new JSON 字符串为数组
const parsePermissionsNew = (permissionsNewStr: string | null | undefined): string[] => {
    if (!permissionsNewStr) return [];
    try {
        const parsed = JSON.parse(permissionsNewStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to parse permissions_new:', e);
        return [];
    }
};

export const useAuthStore = create<AuthState>((set, get) => ({

    initialAuthLoaded: false,
    isLoading: false,
    isAuthenticated: false,
    userPermissions: null,
    permissionsNew: [],
    userName: null,
    token: null,
    error: null,
    userInfo: null,
    isAdvancedTier: false,
    organization_name: null,
    verifyAuth: async () => {
        const token = localStorage.getItem('token');
        const permissions = localStorage.getItem('permissions') || '';
        const organizationName = localStorage.getItem('organization_name');
        const permissionsNewStr = localStorage.getItem('permissions_new');
        const permissionsNew = parsePermissionsNew(permissionsNewStr);
        set({ userPermissions: permissions, permissionsNew, organization_name: organizationName, isLoading: true });

        if (!token) {
            set({
                isLoading: false,
                isAuthenticated: false,
                initialAuthLoaded: true,
                userPermissions: permissions || 'research',
                permissionsNew: [],
                userInfo: null,
                isAdvancedTier: false,
                organization_name: organizationName || null,
            });
            const current = window.location.pathname + window.location.search;
            
            // 使用LoginModal浮层而不是页面跳转
            if (shouldShowLoginModal(window.location.pathname)) {
                triggerLoginModal(current);
            }
            return;
        }

        try {
            const response: any = await verifyService();
            if (response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('permissions');
                localStorage.removeItem('permissions_new');
                localStorage.removeItem('organization_name');
                localStorage.removeItem('email');
                set({
                    isAuthenticated: false,
                    userPermissions: 'research',
                    permissionsNew: [],
                    isLoading: false,
                    initialAuthLoaded: true,
                    userInfo: null,
                    isAdvancedTier: false,
                    organization_name: null,
                });
                return;
            }
            const data = response.data;

            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions || 'research');
            const isAdvancedTier = ['admin', 'enterprise', 'joint'].includes(data.permissions);
            localStorage.setItem('isAdvancedTier', isAdvancedTier ? 'true' : 'false');
            if (data.organization_name) {
                localStorage.setItem('organization_name', data.organization_name);
            }
            if (data.email) {
                localStorage.setItem('email', data.email);
            }
            // 存储 permissions_new
            if (data.permissions_new) {
                localStorage.setItem('permissions_new', data.permissions_new);
            }
            const parsedPermissionsNew = parsePermissionsNew(data.permissions_new);

            set({
                isAuthenticated: true,
                userName: data.username,
                userPermissions: data.permissions || 'research',
                permissionsNew: parsedPermissionsNew,
                isLoading: false,
                initialAuthLoaded: true,
                userInfo: data,
                isAdvancedTier: isAdvancedTier,
                organization_name: data.organization_name || null,
            });
        } catch (err) {
            console.error('Auth verification error:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('permissions');
            localStorage.removeItem('permissions_new');
            localStorage.removeItem('organization_name');
            localStorage.removeItem('email');
            set({
                isAuthenticated: false,
                userPermissions: 'research',
                permissionsNew: [],
                isLoading: false,
                initialAuthLoaded: true,
                userInfo: null,
                isAdvancedTier: false,
                organization_name: null,
            })
        }
    },

    login: async ({ username, password }: { username: string, password: string }) => {
        set({ isLoading: true });
        try {   

            const response: any = await loginService({ username, password });
            const data = response.data;
            const isAdvancedTier = ['admin', 'enterprise', 'joint'].includes(data.permissions);
            const parsedPermissionsNew = parsePermissionsNew(data.permissions_new);

            set({
                isAuthenticated: true,
                isLoading: false,
                token: data.access_token,
                userName: data.username,
                userPermissions: data.permissions || '',
                permissionsNew: parsedPermissionsNew,
                userInfo: data,
                isAdvancedTier: isAdvancedTier,
                organization_name: data.organization_name || null,
            });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('permissions', data.permissions);
            localStorage.setItem('isAdvancedTier', isAdvancedTier ? 'true' : 'false');
            if (data.organization_name) {
                localStorage.setItem('organization_name', data.organization_name);
            }
            if (data.email) {
                localStorage.setItem('email', data.email);
            }
            // 存储 permissions_new
            if (data.permissions_new) {
                localStorage.setItem('permissions_new', data.permissions_new);
            }
            return { success: true, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.msg || 'Authentication failed';
            set({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage, message: errorMessage }
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('permissions');
        localStorage.removeItem('permissions_new');
        localStorage.removeItem('organization_name');
        localStorage.removeItem('email');
        set({
            isAuthenticated: false,
            token: null,
            userPermissions: null,
            permissionsNew: [],
            userName: null,
            isLoading: false,
            error: null,
            organization_name: null
        });
        const current = window.location.pathname + window.location.search;

        // 刷新页面以清除所有状态和缓存的数据
        window.location.reload();
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

            return { success: true, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.msg || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage, message: errorMessage }
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

            return { success: true, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.msg || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage, message: errorMessage }
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

            return { success: true, data: data, message: data.message || data.detail || "" };

        } catch (error) {
            const errorMessage = (error as any)?.msg || 'Network error occurred';
            set({
                error: errorMessage,
                isLoading: false
            });
            return { success: false, error: errorMessage, message: errorMessage }
        }
    },

    hasPermission: (permissionsList?: string[]) => {
        if (!Array.isArray(permissionsList)) throw new Error("hasPermission expects an array of accepted user roles.");

        const { userPermissions } = get();
        return userPermissions ? permissionsList.includes(userPermissions) : false;
    },

    hasPermissionNew: (permission: string) => {
        const { permissionsNew } = get();
        return permissionsNew.includes(permission);
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

    // If the user is not authenticated, trigger login modal instead of redirect
    if (!isAuthenticated) {
        // 触发登录浮层，verifyAuth方法已经处理了这个逻辑
        // 返回一个空的div，让用户留在当前页面
        return <div style={{ display: 'none' }}></div>;
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
