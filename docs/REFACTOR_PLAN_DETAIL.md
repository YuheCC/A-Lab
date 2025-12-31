# app.less 和 global.less 模块化拆分详细方案

## 文件现状

- **app.less**: 1935 行，201 处 !important
- **global.less**: 3553 行，25 处 !important

## 拆分策略

采用"先易后难、模块独立、逐步验证"的策略，每个模块修改后立即验证构建，确保不影响其他功能。

---

## 一、app.less 模块拆分方案（共 10 个模块）

### 模块 1：基础布局模块
**文件位置**: Lines 1-88
**影响范围**: 全局布局容器
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.App
.main-container
.centered-body
.enterprise-page
.enterprise-container
.graph-container
```

**重构任务：**
- 无需重命名（已使用 `.App`, `.main-container` 等专有前缀）
- 检查是否有未使用的类
- 文档化各布局容器的用途

---

### 模块 2：Header 和主导航模块
**文件位置**: Lines 89-287
**影响范围**: 顶部导航栏
**!important数量**: 8
**复杂度**: ⭐⭐ 中

**包含内容：**
```less
.main-header
.logo-container
.main-nav
.nav-item (.active, .disabled, .nav-item-separated)
.nav-dropdown-container
.nav-dropdown (.dropdown-item)
```

**重构任务：**
1. **消除 !important（8 处）：**
   - Line 142: `.nav-item.disabled { color: @color-gray-400 !important; }`
     → 提高选择器优先级：`.main-nav .nav-item.disabled`
   - Line 147: `.nav-item.disabled:hover { color: @color-gray-400 !important; }`
     → 同上
   - Line 233-236: `.nav-dropdown-container.disabled:hover` 的 3 处 !important
     → 改用更高优先级选择器
   - Line 269, 276-277: `.dropdown-item.disabled` 的 3 处 !important
     → 同上

2. **BEM 重构建议：**
```less
/* 可选：采用 BEM 提升可维护性 */
.nav {
  &__header { /* .main-header */ }
  &__logo { /* .logo-container */ }
  &__item {
    &--active { /* .nav-item.active */ }
    &--disabled { /* .nav-item.disabled */ }
    &--separated { /* .nav-item-separated */ }
  }
  &__dropdown {
    &-container { /* .nav-dropdown-container */ }
    &-menu { /* .nav-dropdown */ }
    &-item { /* .dropdown-item */ }
  }
}
```

**验证要点：**
- 导航菜单正常显示和切换
- Hover 效果正常
- 禁用状态样式正确
- 下拉菜单动画和定位正常

---

### 模块 3：用户操作和用户下拉菜单模块
**文件位置**: Lines 288-382
**影响范围**: 用户头像、下拉菜单
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.user-actions
.user-avatar-container
.user-dropdown (.show, .user-info, .dropdown-item)
.subscription-badge
.action-icon
```

**重构任务：**
- 无 !important，无需特殊处理
- 可选：统一 `.dropdown-item` 命名（与导航下拉冲突）→ `.user-dropdown__item`

---

### 模块 4：Chat 布局模块
**文件位置**: Lines 383-480
**影响范围**: 聊天页面布局
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.chat-container
.chat-sidebar
.chat-main
.initial-view
.send-btn
.input-disclaimer
```

**重构任务：**
- 已移除冲突的消息样式（Line 450 注释）
- 检查与 ChatStyles.less 的协同工作
- 无需额外重构

---

### 模块 5：登录页面模块
**文件位置**: Lines 515-586
**影响范围**: 登录、注册等认证页面
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.login-container
.form-group
.login-error-message /* 已重命名，解决冲突 */
```

**重构任务：**
- ✅ 已完成 `.message` → `.login-error-message` 重命名
- 无需额外重构

---

### 模块 6：账户设置模块
**文件位置**: Lines 588-743
**影响范围**: 用户账户设置页面
**!important数量**: 4
**复杂度**: ⭐⭐ 中

**包含内容：**
```less
.user-info-card
.settings-modules
.settings-card
.settings-group
.settings-item
.lang-select
```

**重构任务：**
1. **消除 !important（4 处）：**
   - Line 589: `.page-content.wide { max-width: none !important; ... }`
     → 使用更高优先级选择器或 CSS Grid 布局
   - Line 598: `.account-settings-main.wide { width: 100% !important; }`
     → 同上
   - Line 974-977: 4 处 `max-width: none !important;`
     → 改用 CSS Grid 或更高优先级

2. **建议提取为独立文件：**
   `src/pages/Account/AccountSettings.less`

---

### 模块 7：About 页面模块（最复杂）
**文件位置**: Lines 744-1618
**影响范围**: About/Landing 页面
**!important数量**: 154（占 app.less 的 76.6%）
**复杂度**: ⭐⭐⭐⭐⭐ 极高

**包含内容：**
```less
.about-page-body
.about-header
.hero-section
.content-sections
.feature-grid
.features-flex
.pricing-grid
.pricing-card
.news-feed
.site-footer
```

**重构任务：**
1. **!important 分类处理（154 处）：**

   **A. 内容隔离必须保留（约 80 处）：**
   ```less
   /* 图片保护 - 必须保留 */
   .about-page-body img {
     max-width: 100% !important;
     height: auto !important;
   }

   /* 布局锁定 - 必须保留 */
   .about-page-body {
     overflow-x: hidden !important;
     width: 100% !important;
   }
   ```

   **B. 可优化项（约 40 处）：**
   ```less
   /* 原代码 - Line 1387 */
   .pricing-grid {
     gap: 1.2rem !important;
   }

   /* 优化后 */
   .about-page-body .pricing-grid {
     gap: 1.2rem; /* 提高选择器优先级 */
   }
   ```

   **C. 布局覆盖（约 34 处）：**
   ```less
   /* Lines 974-977 */
   .page-content,
   .account-settings-main.wide {
     max-width: none !important;
     width: 100% !important;
   }

   /* 优化：使用 CSS Grid */
   .account-settings-wrapper {
     display: grid;
     grid-template-columns: 1fr;
   }
   .account-settings-wrapper .page-content {
     max-width: 100%;
     width: 100%;
   }
   ```

2. **建议提取为独立文件：**
   `src/pages/About/AboutPage.less`（约 875 行）

3. **分步重构计划：**
   - 步骤 1：提取到独立文件（不修改内容）
   - 步骤 2：优化可优化的 40 处 !important
   - 步骤 3：添加注释说明必须保留的 !important

---

### 模块 8：Modal 弹窗模块
**文件位置**: Lines 1620-1697
**影响范围**: 通用弹窗
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.modal
.modal-content
.modal-header
.modal-body
.modal-footer
.close-btn
@keyframes animatetop
```

**重构任务：**
- 建议重命名为 `.global-modal` 避免通用命名冲突
- 提取到独立文件：`src/components/Modal/modal-base.less`

---

### 模块 9：页面布局容器模块
**文件位置**: Lines 1699-1728
**影响范围**: 通用两列布局
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.page-content
.column-left
.column-right
```

**重构任务：**
- 检查是否与模块 6 的 `.page-content.wide` 冲突
- 考虑重命名为 `.two-column-layout`, `.two-column-layout__left`, `.two-column-layout__right`

---

### 模块 10：定价切换和设置模态框模块
**文件位置**: Lines 1730-1935
**影响范围**: 定价页切换器、设置模态框
**!important数量**: 35
**复杂度**: ⭐⭐⭐ 高

**包含内容：**
```less
.pricing-switcher
.pricing-switch-btn
.pricing-group
.modal.show
.settings-modal
.settings-modal-content
.settings-tab
```

**重构任务：**
1. **消除 !important（35 处）：**

   **A. 定价切换器（Lines 1732-1775）：13 处**
   ```less
   /* 原代码 */
   .pricing-switcher {
     display: flex !important;
     justify-content: center !important;
   }

   /* 优化：提高选择器优先级 */
   .about-page-body .pricing-switcher {
     display: flex;
     justify-content: center;
   }
   ```

   **B. 设置模态框（Lines 1778-1915）：22 处**
   ```less
   /* 原代码 - Lines 1784-1789 */
   .settings-modal.modal.show {
     display: flex !important;
     flex-direction: row !important;
     align-items: center !important;
     z-index: 2000 !important;
   }

   /* 优化：建立 z-index 层级系统 */
   /* src/styles/z-index.less */
   @z-modal-backdrop: 1000;
   @z-modal-content: 1001;
   @z-settings-modal: 2000;

   /* 优化后 */
   .settings-modal.modal.show {
     display: flex;
     flex-direction: row;
     align-items: center;
     z-index: @z-settings-modal;
   }
   ```

2. **建议提取为独立文件：**
   - 定价切换器 → `src/pages/About/PricingSwitcher.less`
   - 设置模态框 → `src/components/SettingModal/settingModal.less`（已存在，合并样式）

---

## 二、global.less 模块拆分方案（共 17 个模块）

### 模块 1：根元素和 App 基础模块
**文件位置**: Lines 1-36
**影响范围**: 全局基础
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
#root
.App
.app-loading
```

**重构任务：**
- 检查与 app.less 中的 `.App` 是否冲突（定义重复）
- 保留 global.less 中的定义，移除 app.less 中的重复

---

### 模块 2：老旧 Navbar 模块（可能废弃）
**文件位置**: Lines 37-127
**影响范围**: 旧版导航栏
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.navbar
.navbar-title
.navbar-logo
.app-tabs
.tab-button
.App-header
```

**重构任务：**
- **关键决策**：确认是否仍在使用
- 如果已废弃，直接删除
- 如果仍在使用，重命名为 `.legacy-navbar` 并添加废弃警告

---

### 模块 3：通用错误样式模块（冲突风险）
**文件位置**: Lines 135-137
**影响范围**: 全局错误文本
**!important数量**: 0
**复杂度**: ⭐⭐ 中（命名冲突风险高）

**包含内容：**
```less
.error {
  color: #e74c3c;
}
```

**重构任务：**
- **高优先级**：重命名为 `.global-error-text` 避免冲突
- 全局搜索替换所有引用（预估 5-10 个文件）

---

### 模块 4：主容器和图表模块
**文件位置**: Lines 139-229
**影响范围**: 图表页面布局
**!important数量**: 0
**复杂度**: ⭐ 低

**包含内容：**
```less
.main-container  /* 与 app.less 冲突 */
.graph-container /* 与 app.less 冲突 */
.info-panel
.node-details
.loading-message
```

**重构任务：**
- **冲突解决**：重命名为 `.graph-page-container`, `.graph-panel`
- 检查哪个文件的定义在实际使用

---

### 模块 5：弹窗模块
**文件位置**: Lines 231-415
**影响范围**: 分子信息弹窗
**!important数量**: 2
**复杂度**: ⭐⭐ 中

**包含内容：**
```less
.popup-overlay
.popup-content
.black-bg
.dark-field
.dark-table
.close-button
.copy-button
.property-table
.raw-data
```

**重构任务：**
1. **消除 !important（2 处）：**
   - Line 270: `.white-text { color: #fff !important; }`
     → 提高选择器：`.popup-content.black-bg .white-text`
   - Line 274: `.dark-field { background-color: #222 !important; ... }`
     → 同上

2. **建议提取为独立文件：**
   `src/components/NodePopup/NodePopup.less`

---

### 模块 6：滑块和过滤器模块
**文件位置**: Lines 417-562
**影响范围**: 搜索页过滤器
**!important数量**: 0
**复杂度**: ⭐⭐ 中

**包含内容：**
```less
.sliders-container
.slider-container
.slider-header
.filter-wrapper
.reset-filter-button
.reset-button
```

**重构任务：**
- 建议重命名为 `.filter-*` 前缀
- 提取到 `src/pages/Search/SearchFilters.less`

---

### 模块 7：About Page 样式模块
**文件位置**: Lines 563-852
**影响范围**: About 页面
**!important数量**: 未知（需详细统计）
**复杂度**: ⭐⭐⭐ 高

**重构任务：**
- **合并处理**：与 app.less 的 About 模块合并
- 统一到 `src/pages/About/AboutPage.less`

---

### 模块 8-17：其他页面模块（详细信息见附录）

由于篇幅限制，以下模块采用相同处理策略：
- 提取到对应页面的独立 Less 文件
- 重命名通用类名添加模块前缀
- 消除不必要的 !important

---

## 三、实施顺序建议

### 第一批（低风险，快速见效）
1. ✅ **app.less 模块 5** - 登录页面（已完成）
2. **app.less 模块 8** - Modal 弹窗（无 !important，低风险）
3. **global.less 模块 3** - 错误样式重命名（影响小）
4. **app.less 模块 3** - 用户操作（无 !important）

**预计时间**: 0.5 天
**预计消除 !important**: 0 处
**预计解决冲突**: 2 处

---

### 第二批（中等风险，需要测试）
5. **app.less 模块 2** - Header 和导航（8 处 !important）
6. **app.less 模块 6** - 账户设置（4 处 !important）
7. **global.less 模块 5** - 弹窗（2 处 !important）
8. **app.less 模块 9** - 页面布局容器

**预计时间**: 1 天
**预计消除 !important**: 14 处
**预计解决冲突**: 3 处

---

### 第三批（高风险，需要仔细规划）
9. **app.less 模块 10** - 定价切换和设置模态框（35 处 !important）
10. **global.less 模块 2/4** - Navbar 和容器冲突解决

**预计时间**: 1 天
**预计消除 !important**: 约 25 处（保留 10 处必要的）
**预计解决冲突**: 4 处

---

### 第四批（最复杂，分步实施）
11. **app.less 模块 7** - About 页面（154 处 !important）
    - 步骤 1：提取到独立文件（0.5 天）
    - 步骤 2：优化 40 处非必要 !important（1 天）
    - 步骤 3：文档化必要的 !important（0.5 天）

**预计时间**: 2 天
**预计消除 !important**: 约 40 处
**预计保留并文档化**: 约 114 处

---

## 四、验证清单

每个模块重构后必须验证：

### 构建验证
- [ ] `npm run build` 无错误
- [ ] `npm run lint:style` 通过（如已配置）
- [ ] 无 TypeScript 类型错误

### 功能验证
- [ ] 相关页面正常显示
- [ ] Hover、Active 等交互状态正常
- [ ] 响应式布局正常（测试移动端）
- [ ] 弹窗/模态框正常工作

### 视觉验证
- [ ] 与修改前截图对比无差异
- [ ] 浏览器开发者工具检查样式覆盖情况

---

## 五、风险控制

### 回滚机制
- 每个模块开始前创建 Git 分支
- 保留原文件备份（.backup 后缀）
- 构建失败立即回滚

### 冲突解决策略
1. **优先级判断**：如果两个文件定义同一类名，保留使用频率高的
2. **作用域隔离**：使用页面级 class 或 ID 包裹
3. **BEM 重构**：对于复杂组件，采用 BEM 命名彻底隔离

---

## 六、成功指标

### 定量指标
- [ ] app.less !important 从 201 → < 120（减少 40%）
- [ ] global.less !important 从 25 → < 15（减少 40%）
- [ ] 消除所有类名冲突（预估 8-10 处）
- [ ] 提取独立文件 5-8 个

### 定性指标
- [ ] 代码可维护性显著提升
- [ ] 样式作用域清晰
- [ ] 团队成员理解并认可新结构

---

## 附录：快速参考表

| 模块 | 文件 | 行数 | !important | 优先级 | 预计耗时 |
|------|------|------|------------|--------|----------|
| app.less M2 | app.less | 89-287 | 8 | 中 | 2h |
| app.less M6 | app.less | 588-743 | 4 | 中 | 2h |
| app.less M7 | app.less | 744-1618 | 154 | 高 | 2天 |
| app.less M10 | app.less | 1730-1935 | 35 | 高 | 1天 |
| global.less M3 | global.less | 135-137 | 0 | 高（冲突） | 1h |
| global.less M5 | global.less | 231-415 | 2 | 中 | 2h |

**总计预计时间**: 5-6 个工作日
**预计消除 !important**: 约 80-100 处
**预计解决冲突**: 约 10-15 处
