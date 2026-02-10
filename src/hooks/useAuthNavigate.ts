import { useNavigate } from '@umijs/max';
import { useCallback } from 'react';

/**
 * 验证导航参数名，用于标记需要验证身份的导航
 */
export const VERIFY_AUTH_PARAM = '_verifyAuth';

interface AuthNavigateOptions {
  replace?: boolean;
  state?: any;
  /** 是否跳过身份验证，默认 false（即默认会触发验证） */
  skipVerifyAuth?: boolean;
}

type To = string | Partial<{ pathname: string; search: string; hash: string }>;

/**
 * 封装 useNavigate，默认在导航时添加 _verifyAuth 参数以触发身份验证。
 * Layout 层会监听该参数，存在时自动调用 verifyAuth() 验证用户身份。
 *
 * @example
 * const navigate = useAuthNavigate();
 *
 * // 默认会触发身份验证
 * navigate('/predict/create');
 *
 * // 带 query 参数
 * navigate('/predict/detail?id=123');
 *
 * // 跳过身份验证
 * navigate('/map', { skipVerifyAuth: true });
 *
 * // 对象形式
 * navigate({ pathname: '/predict/create', search: '?type=new' });
 *
 * // 数字导航（前进/后退），不会附加参数
 * navigate(-1);
 */
export function useAuthNavigate() {
  const navigate = useNavigate();

  const authNavigate = useCallback(
    (to: To | number, options?: AuthNavigateOptions) => {
      // 数字导航（前进/后退），直接透传
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      const { skipVerifyAuth = false, ...navigateOptions } = options || {};

      // 跳过身份验证时，直接透传
      if (skipVerifyAuth) {
        navigate(to as any, navigateOptions);
        return;
      }

      // 处理字符串路径
      if (typeof to === 'string') {
        const url = new URL(to, window.location.origin);
        url.searchParams.set(VERIFY_AUTH_PARAM, '1');
        const targetPath = url.pathname + url.search + (url.hash || '');
        navigate(targetPath, navigateOptions);
        return;
      }

      // 处理对象形式的路径 { pathname, search, hash }
      if (typeof to === 'object') {
        const searchParams = new URLSearchParams(to.search || '');
        searchParams.set(VERIFY_AUTH_PARAM, '1');
        const searchStr = searchParams.toString();
        navigate(
          {
            ...to,
            search: searchStr ? `?${searchStr}` : '',
          } as any,
          navigateOptions,
        );
        return;
      }

      // fallback
      navigate(to as any, navigateOptions);
    },
    [navigate],
  );

  return authNavigate;
}
