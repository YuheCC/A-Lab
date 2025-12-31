import type { RuntimeConfig } from '@umijs/max';
import "@/locales/i18n"
import "./app.less"
import { MessageProvider } from './components/MessageProvider';
import '@/utils/echartsInit'; // 初始化 ECharts 组件

// 运行时配置
export const app: RuntimeConfig = {
    
};

// 导出配置（如果需要默认导出）
export default app; 