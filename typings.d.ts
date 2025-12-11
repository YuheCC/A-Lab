import 'umi/typings';

declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// Global variable declarations from UmiJS define
declare const BASE_URL: string;
declare const ENVIRONMENT: 'production' | 'staging' | 'development';
declare const WS_BASE_URL: string;
declare const explorer_url: string;
declare const team_url: string;
declare const ShowFindFriendsAdvancedOptions: boolean;
