# 多语言支持 (Internationalization)

本项目已集成了完整的多语言支持功能，支持中文和英文两种语言。

## 功能特性

- ✅ 支持中文和英文切换
- ✅ 自动检测浏览器语言
- ✅ 语言偏好本地存储
- ✅ 实时语言切换，无需刷新页面
- ✅ 响应式语言切换器组件

## 文件结构

```
src/
├── i18n.js                           # 国际化配置文件
├── components/
│   ├── LanguageSwitcher.js           # 语言切换组件
│   ├── LanguageSwitcher.css          # 语言切换器样式
│   └── WelcomeMessage.js             # 多语言示例组件
└── pages/
    └── AboutPage.js                  # 已集成多语言的示例页面
```

## 使用方法

### 1. 在组件中使用翻译

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('common.loading')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
};
```

### 2. 添加新的翻译文本

在 `src/i18n.js` 文件中的 `resources` 对象中添加新的翻译键值对：

```javascript
resources: {
  en: {
    translation: {
      // 添加新的英文翻译
      myNewSection: {
        title: 'My New Title',
        description: 'My new description'
      }
    }
  },
  zh: {
    translation: {
      // 添加对应的中文翻译
      myNewSection: {
        title: '我的新标题',
        description: '我的新描述'
      }
    }
  }
}
```

### 3. 使用语言切换器

语言切换器已经集成在导航栏中，用户可以点击 "EN" 或 "中" 按钮来切换语言。

### 4. 编程方式切换语言

```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { i18n } = useTranslation();

  const changeToEnglish = () => {
    i18n.changeLanguage('en');
  };

  const changeToChinese = () => {
    i18n.changeLanguage('zh');
  };

  return (
    <div>
      <button onClick={changeToEnglish}>English</button>
      <button onClick={changeToChinese}>中文</button>
    </div>
  );
};
```

## 已定义的翻译键

### 导航 (nav)
- `nav.home` - 首页/Home
- `nav.explorer` - 探索器/Explorer
- `nav.map` - 地图/Map
- `nav.search` - 搜索/Search
- `nav.favorites` - 收藏/Favorites
- `nav.about` - 关于/About
- `nav.login` - 登录/Login
- `nav.logout` - 退出/Logout

### 通用 (common)
- `common.loading` - 加载中.../Loading...
- `common.error` - 错误/Error
- `common.success` - 成功/Success
- `common.cancel` - 取消/Cancel
- `common.confirm` - 确认/Confirm
- `common.save` - 保存/Save
- `common.search` - 搜索/Search

### 分子相关 (molecule)
- `molecule.smiles` - SMILES
- `molecule.molecularWeight` - 分子量/Molecular Weight
- `molecule.properties` - 属性/Properties
- `molecule.addToFavorites` - 添加到收藏/Add to Favorites

### 搜索 (search)
- `search.placeholder` - 搜索分子.../Search molecules...
- `search.results` - 搜索结果/Search Results
- `search.noResults` - 未找到结果/No results found

### 聊天 (chat)
- `chat.welcome` - 欢迎来到分子宇宙.../Welcome to the Molecular Universe...
- `chat.placeholder` - 输入您的消息.../Type your message...
- `chat.send` - 发送/Send

### 认证 (auth)
- `auth.login` - 登录/Login
- `auth.register` - 注册/Register
- `auth.email` - 邮箱/Email
- `auth.password` - 密码/Password

### 收藏 (favorites)
- `favorites.title` - 我的收藏/My Favorites
- `favorites.empty` - 暂无收藏/No favorites yet
- `favorites.added` - 已添加到收藏/Added to favorites

## 配置选项

### 语言检测顺序
1. localStorage (用户之前的选择)
2. navigator (浏览器语言设置)
3. htmlTag (HTML lang 属性)

### 默认语言
- 回退语言：英文 (en)
- 支持的语言：英文 (en)、中文 (zh)

## 扩展支持更多语言

要添加新语言支持，请在 `src/i18n.js` 中的 `resources` 对象中添加新的语言配置：

```javascript
resources: {
  en: { /* 英文翻译 */ },
  zh: { /* 中文翻译 */ },
  ja: {  // 添加日文支持
    translation: {
      nav: {
        home: 'ホーム',
        search: '検索',
        // ... 其他翻译
      }
    }
  }
}
```

然后在 `LanguageSwitcher.js` 中添加对应的按钮。

## 最佳实践

1. **保持翻译键的一致性** - 使用有意义的嵌套结构
2. **避免硬编码文本** - 所有用户可见的文本都应该通过 `t()` 函数
3. **提供回退文本** - 确保所有翻译键都有英文版本作为回退
4. **测试所有语言** - 确保在不同语言下界面布局正常
5. **考虑文本长度差异** - 不同语言的文本长度可能差异很大

## 示例组件

查看 `src/components/WelcomeMessage.js` 了解如何在组件中正确使用多语言功能。

## 故障排除

### 翻译不显示
- 检查翻译键是否正确
- 确认 `src/i18n.js` 已正确导入到 `src/index.js`
- 检查浏览器控制台是否有错误信息

### 语言切换不生效
- 确认 `LanguageSwitcher` 组件已正确导入和使用
- 检查 localStorage 中是否有语言设置冲突

### 新添加的翻译不显示
- 确认翻译已添加到所有支持的语言中
- 重启开发服务器以确保配置生效 