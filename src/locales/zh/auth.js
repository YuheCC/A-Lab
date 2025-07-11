export default {
  header: {
    welcomeBack: '欢迎回来',
    createAccount: '创建账户',
    signInSubtitle: '登录以访问分子宇宙',
    signUpSubtitle: '加入分子宇宙社区'
  },
  form: {
    firstName: '名',
    lastName: '姓',
    organizationName: '组织名称',
    username: '用户名',
    email: '邮箱地址',
    emailPlaceholder: '邮箱地址',
    password: '密码',
    processing: '处理中...',
    signIn: '登录',
    createAccount: '创建账户',
    passwordPlaceholder: '密码',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '确认密码',
    passwordsDoNotMatch: '密码不匹配'
  },
  switch: {
    noAccount: '还没有账户？',
    signUp: '注册',
    redeemCode: '团队成员兑换码',
    forgotPassword: '忘记密码？',
    reset: '重置',
    haveAccount: '已有账户？',
    signIn: '登录',
    termsText: '使用分子宇宙即表示您同意SES AI的',
    termsLink: '条款和条件'
  },
  messages: {
    verificationSent: '验证邮件已发送。',
    emailAddressDenied: "很抱歉，由于相关合规政策限制，您的邮箱暂无法注册或使用分子宇宙服务，感谢您的理解与支持。"
  },
  verifyCode: {
    header: {
      title: '验证码验证',
      subtitle: '请输入您收到的验证码'
    },
    form: {
      code: '验证码',
      codePlaceholder: '请输入6位验证码',
      verify: '验证',
      processing: '验证中...'
    },
    messages: {
      success: '验证成功！',
      failed: '验证失败，请检查验证码是否正确',
      expired: '验证码已过期，请重新获取',
      invalidCode: '验证码格式不正确，请输入6位数字',
      invalidLink: '无效的验证链接',
      redirecting: '正在跳转到登录页面...'
    },
    switch: {
      backToLogin: '返回登录'
    }
  },
  logo: {
    alt: 'SES AI 标志'
  },
  redeem: {
    header: {
      title: '兑换团队代码',
      subtitle: '加入您在分子宇宙平台上的团队'
    },
    form: {
      firstName: '名',
      lastName: '姓',
      username: '用户名',
      email: '邮箱地址',
      emailPlaceholder: '邮箱地址',
      teamCode: '团队代码',
      teamCodePlaceholder: '请输入您的团队代码',
      processing: '处理中...',
      redeemCode: '兑换代码'
    },
    messages: {
      defaultSuccess: '账户创建成功。请查看您的收件箱获取临时密码。',
      defaultError: '代码兑换失败'
    },
    switch: {
      haveAccount: '已有账户？',
      signIn: '登录'
    }
  },
  forgotPassword: {
    header: {
      title: '忘记密码',
      subtitle: '输入您的详细信息以重置密码'
    },
    form: {
      firstName: '名',
      lastName: '姓',
      email: '邮箱地址',
      emailPlaceholder: '邮箱地址',
      processing: '处理中...',
      resetPassword: '重置密码'
    },
    messages: {
      defaultSuccess: '如果您的信息与我们的记录匹配，将发送密码重置邮件。',
      defaultError: '密码重置请求失败'
    },
    switch: {
      rememberedPassword: '想起密码了？',
      signIn: '登录'
    }
  },
  passwordReset: {
    header: {
      title: '重置密码',
      subtitle: '请输入您的当前密码和新密码'
    },
    form: {
      currentPassword: '当前密码',
      currentPasswordPlaceholder: '当前密码',
      newPassword: '新密码',
      newPasswordPlaceholder: '新密码',
      confirmPassword: '确认新密码',
      confirmPasswordPlaceholder: '确认新密码',
      processing: '重置中...',
      resetPassword: '重置密码'
    },
    messages: {
      passwordsNotMatch: '新密码不匹配',
      passwordTooShort: '新密码必须至少6个字符',
      defaultError: '密码重置失败',
      defaultSuccess: '密码重置成功'
    }
  },
  verifyEducation: {
    header: {
      title: '验证教育身份',
      subtitle: '请输入您收到的验证码以验证您的教育身份'
    },
    form: {
      code: '验证码',
      codePlaceholder: '请输入6位验证码',
      verify: '验证',
      processing: '验证中...'
    },
    messages: {
      success: '教育身份验证成功！',
      failed: '验证失败，请检查验证码是否正确',
      expired: '验证码已过期，请重新获取',
      invalidCode: '验证码格式不正确，请输入6位数字',
      invalidLink: '无效的验证链接',
      redirecting: '正在跳转到设置页面...'
    },
    switch: {
      backToSettings: '返回设置'
    }
  }
}; 