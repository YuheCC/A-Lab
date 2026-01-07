/**
 * FeatureCardGroup 使用示例
 * 
 * 本文件展示了 FeatureCardGroup 组件的各种使用场景
 */

import React from 'react';
import { Plus, Activity, TrendingUp, Target, Zap, Database } from 'lucide-react';
import FeatureCardGroup from './index';
import FeatureCard from '../FeatureCard';

const FeatureCardGroupExamples: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>FeatureCardGroup 使用示例</h1>

      {/* 示例1: 固定2列布局 */}
      <section style={{ marginBottom: '48px' }}>
        <h2>示例1: 固定2列布局（工具入口场景）</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          适用于主要功能入口，桌面端和移动端都保持2列布局
        </p>
        <FeatureCardGroup columns={2} gap={16}>
          <FeatureCard
            icon={<Plus size={20} />}
            title="新建设计"
            description="创建新的电解液设计方案"
            iconBgColor="#dbeafe"
            onClick={() => console.log('新建设计')}
          />
          <FeatureCard
            icon={<Activity size={20} />}
            title="模型训练"
            description="训练新的预测模型"
            iconBgColor="#dcfce7"
            onClick={() => console.log('模型训练')}
          />
        </FeatureCardGroup>
      </section>

      {/* 示例2: 响应式布局（桌面优先） */}
      <section style={{ marginBottom: '48px' }}>
        <h2>示例2: 响应式布局（产品功能展示）</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          移动端1列，平板2列，笔记本3列，桌面4列
        </p>
        <FeatureCardGroup 
          columns={{
            default: 1,  // 移动端: 1列
            sm: 2,       // 平板: 2列
            md: 2,       // 平板横屏: 2列
            lg: 3,       // 笔记本: 3列
            xl: 4,       // 桌面: 4列
          }}
          gap={20}
        >
          <FeatureCard
            icon={<Plus size={20} />}
            title="新建设计"
            description="创建新的电解液设计方案"
            iconBgColor="#dbeafe"
          />
          <FeatureCard
            icon={<Activity size={20} />}
            title="模型训练"
            description="训练新的预测模型"
            iconBgColor="#dcfce7"
          />
          <FeatureCard
            icon={<TrendingUp size={20} />}
            title="趋势分析"
            description="分析历史数据趋势"
            iconBgColor="#fef3c7"
          />
          <FeatureCard
            icon={<Target size={20} />}
            title="结果预测"
            description="预测设计结果"
            iconBgColor="#ede9fe"
          />
        </FeatureCardGroup>
      </section>

      {/* 示例3: 特性列表（移动端优先） */}
      <section style={{ marginBottom: '48px' }}>
        <h2>示例3: 特性列表（移动端优先）</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          移动端1列，逐步增加到6列（极大屏）
        </p>
        <FeatureCardGroup 
          columns={{
            default: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            xxl: 6
          }}
          gap={16}
        >
          <FeatureCard
            icon={<Plus size={20} />}
            title="新建设计"
            description="创建新的电解液设计方案"
            iconBgColor="#dbeafe"
          />
          <FeatureCard
            icon={<Activity size={20} />}
            title="模型训练"
            description="训练新的预测模型"
            iconBgColor="#dcfce7"
          />
          <FeatureCard
            icon={<TrendingUp size={20} />}
            title="趋势分析"
            description="分析历史数据趋势"
            iconBgColor="#fef3c7"
          />
          <FeatureCard
            icon={<Target size={20} />}
            title="结果预测"
            description="预测设计结果"
            iconBgColor="#ede9fe"
          />
          <FeatureCard
            icon={<Zap size={20} />}
            title="优化建议"
            description="获取优化建议"
            iconBgColor="#fee2e2"
          />
          <FeatureCard
            icon={<Database size={20} />}
            title="数据管理"
            description="管理实验数据"
            iconBgColor="#fce7f3"
          />
        </FeatureCardGroup>
      </section>

      {/* 示例4: 禁用状态 */}
      <section style={{ marginBottom: '48px' }}>
        <h2>示例4: 包含禁用状态的卡片</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          展示部分功能暂时不可用的场景
        </p>
        <FeatureCardGroup columns={3} gap={16}>
          <FeatureCard
            icon={<Plus size={20} />}
            title="新建设计"
            description="创建新的电解液设计方案"
            iconBgColor="#dbeafe"
            onClick={() => console.log('新建设计')}
          />
          <FeatureCard
            icon={<Activity size={20} />}
            title="模型训练（即将推出）"
            description="训练新的预测模型"
            iconBgColor="#dcfce7"
            disabled={true}
          />
          <FeatureCard
            icon={<TrendingUp size={20} />}
            title="趋势分析"
            description="分析历史数据趋势"
            iconBgColor="#fef3c7"
            onClick={() => console.log('趋势分析')}
          />
        </FeatureCardGroup>
      </section>

      {/* 示例5: 自定义样式 */}
      <section style={{ marginBottom: '48px' }}>
        <h2>示例5: 自定义样式和间距</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          使用更大的间距和自定义背景
        </p>
        <FeatureCardGroup 
          columns={2} 
          gap={32}
          className="custom-group"
          style={{ 
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}
        >
          <FeatureCard
            icon={<Plus size={20} />}
            title="新建设计"
            description="创建新的电解液设计方案"
            iconBgColor="#dbeafe"
            onClick={() => console.log('新建设计')}
          />
          <FeatureCard
            icon={<Activity size={20} />}
            title="模型训练"
            description="训练新的预测模型"
            iconBgColor="#dcfce7"
            onClick={() => console.log('模型训练')}
          />
        </FeatureCardGroup>
      </section>
    </div>
  );
};

export default FeatureCardGroupExamples;
