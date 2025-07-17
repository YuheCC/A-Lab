export default {
  header: {
    welcomeBack: 'おかえりなさい',
    createAccount: 'アカウント作成',
    signInSubtitle: 'Molecular Universeにアクセスするためにサインインしてください',
    signUpSubtitle: 'Molecular Universeコミュニティに参加する'
  },
  form: {
    firstName: '名',
    lastName: '姓',
    organizationName: '組織名',
    username: 'ユーザー名',
    email: 'メールアドレス',
    emailPlaceholder: 'メールアドレス',
    password: 'パスワード',
    passwordPlaceholder: 'パスワード',
    confirmPassword: 'パスワードの確認',
    confirmPasswordPlaceholder: 'パスワードを再入力してください',
    processing: '処理中...',
    signIn: 'サインイン',
    createAccount: 'アカウントを作成',
    passwordsDoNotMatch: 'パスワードが一致しません',
    termsRequired: 'サインインする前に利用規約に同意する必要があります'
  },
  switch: {
    noAccount: "アカウントをお持ちでないですか？",
    signUp: 'サインアップ',
    redeemCode: 'チームメンバー用のコードを引き換える',
    forgotPassword: 'パスワードをお忘れですか？',
    reset: 'リセット',
    haveAccount: 'すでにアカウントをお持ちですか？',
    signIn: 'サインイン',
    termsText: 'Molecular Universeを使用することにより、SES AIの',
    termsLink: '利用規約',
    loginTermsText: '私はSES AIの',
    loginTermsLink: '利用規約とプライバシーポリシーを読み、同意します'
  },
  messages: {
    verificationSent: '確認メールが送信されました。',
    emailAddressDenied: "残念ながら、あなたまたはあなたの関連団体が米国商務省、国務省、財務省のスクリーニングリストの1つ以上に該当するため、Molecular Universeサービスを提供することができません。"
  },
  verifyCode: {
    header: {
      title: 'コードの確認',
      subtitle: '受信した確認コードを入力してください'
    },
    form: {
      code: '確認コード',
      codePlaceholder: '6桁のコードを入力',
      verify: '確認',
      processing: '確認中...'
    },
    messages: {
      success: '確認に成功しました！',
      failed: '確認に失敗しました。コードが正しいか確認してください',
      expired: '確認コードの有効期限が切れました。新しいコードをリクエストしてください',
      invalidCode: '無効なコード形式です。6桁の数字を入力してください',
      invalidLink: '無効な確認リンクです',
      redirecting: 'ログインページにリダイレクトしています...'
    },
    switch: {
      backToLogin: 'ログインに戻る'
    }
  },
  logo: {
    alt: 'SES AIロゴ'
  },
  redeem: {
    header: {
      title: 'チームコードの引き換え',
      subtitle: 'Molecular Universeプラットフォームでチームに参加しましょう'
    },
    form: {
      firstName: '名',
      lastName: '姓',
      username: 'ユーザー名',
      email: 'メールアドレス',
      emailPlaceholder: 'メールアドレス',
      teamCode: 'チームコード',
      teamCodePlaceholder: 'チームコードを入力してください',
      processing: '処理中...',
      redeemCode: 'コードを引き換える'
    },
    messages: {
      defaultSuccess: 'アカウントが正常に作成されました。受信トレイで仮パスワードを確認してください。',
      defaultError: 'バウチャーの引き換えに失敗しました'
    },
    switch: {
      haveAccount: 'すでにアカウントをお持ちですか？',
      signIn: 'サインイン'
    }
  },
  forgotPassword: {
    header: {
      title: 'パスワードをお忘れですか',
      subtitle: 'パスワードをリセットするための詳細情報を入力してください'
    },
    form: {
      firstName: '名',
      lastName: '姓',
      email: 'メールアドレス',
      emailPlaceholder: 'メールアドレス',
      processing: '処理中...',
      sendResetPassword: 'パスワードリセットメールを送信',
      newPassword: '新しいパスワード',
      newPasswordPlaceholder: '新しいパスワード'
    },
    messages: {
      defaultSuccess: '情報が記録と一致する場合、パスワードリセットメールが送信されます。',
      defaultError: 'パスワードリセットリクエストに失敗しました',
      resetLinkSent: 'リセットリンクがメールに送信されました。メールを確認して認証してください'
    },
    switch: {
      rememberedPassword: 'パスワードを思い出しましたか？',
      signIn: 'サインイン'
    }
  },
  passwordReset: {
    header: {
      title: 'パスワードのリセット',
      subtitle: '現在のパスワードと新しいパスワードを入力してください'
    },
    form: {
      currentPassword: '現在のパスワード',
      currentPasswordPlaceholder: '現在のパスワード',
      newPassword: '新しいパスワード',
      newPasswordPlaceholder: '新しいパスワード',
      confirmPassword: '新しいパスワードの確認',
      confirmPasswordPlaceholder: '新しいパスワードを再入力',
      processing: 'リセット中...',
      resetPassword: 'パスワードをリセット'
    },
    messages: {
      passwordsNotMatch: '新しいパスワードが一致しません',
      passwordTooShort: '新しいパスワードは6文字以上である必要があります',
      defaultError: 'パスワードのリセットに失敗しました',
      defaultSuccess: 'パスワードのリセットに成功しました'
    }
  },
  resetPassword: {
    header: {
      title: 'パスワードのリセット',
      subtitle: '新しいパスワードを入力してください'
    },
    form: {
      newPassword: '新しいパスワード',
      newPasswordPlaceholder: '新しいパスワードを入力',
      confirmPassword: '新しいパスワードの確認',
      confirmPasswordPlaceholder: '新しいパスワードを再入力',
      processing: 'リセット中...',
      resetPassword: 'パスワードをリセット'
    },
    messages: {
      passwordsNotMatch: 'パスワードが一致しません',
      passwordTooShort: 'パスワードは6文字以上である必要があります',
      defaultError: 'パスワードのリセットに失敗しました',
      defaultSuccess: 'パスワードのリセットに成功しました！ログインページにリダイレクトしています...',
      invalidLink: '無効なリセットリンクです'
    },
    switch: {
      backToLogin: 'ログインに戻る'
    }
  },
  verifyEducation: {
    header: {
      title: '教育機関の本人確認',
      subtitle: '教育機関の本人確認を行うために、受信した確認コードを入力してください'
    },
    form: {
      code: '確認コード',
      codePlaceholder: '6桁のコードを入力',
      verify: '確認',
      processing: '確認中...'
    },
    messages: {
      success: '教育機関の本人確認に成功しました！',
      failed: '確認に失敗しました。コードが正しいか確認してください',
      expired: '確認コードの有効期限が切れました。新しいコードをリクエストしてください',
      invalidCode: '無効なコード形式です。6桁の数字を入力してください',
      invalidLink: '無効な確認リンクです',
      redirecting: '設定ページにリダイレクトしています...'
    },
    switch: {
      backToSettings: '設定に戻る'
    }
  },
  verifyForgotPassword: {
    header: {
      title: 'パスワード忘れの確認',
      subtitle: 'パスワードをリセットするために、受信した確認コードを入力してください'
    },
    form: {
      code: '確認コード',
      codePlaceholder: '6桁のコードを入力',
      verify: '確認',
      processing: '確認中...'
    },
    messages: {
      success: '確認に成功しました！',
      failed: '確認に失敗しました。コードが正しいか確認してください',
      expired: '確認コードの有効期限が切れました。新しいコードをリクエストしてください',
      invalidCode: '無効なコード形式です。6桁の数字を入力してください',
      invalidLink: '無効な確認リンクです'
    }
  }
}; 