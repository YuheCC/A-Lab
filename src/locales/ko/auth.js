export default {
  header: {
    welcomeBack: '환영합니다',
    createAccount: '계정 생성',
    signInSubtitle: 'Molecular Universe 접속을 위해 로그인해 주세요.',
    signUpSubtitle: 'Molecular Universe 커뮤니티에 참여하세요'
  },
  form: {
    firstName: '이름',
    lastName: '성',
    organizationName: '조직명',
    username: '아이디',
    email: '이메일 주소',
    emailPlaceholder: '이메일 주소',
    password: '비밀번호',
    passwordPlaceholder: '비밀번호',
    confirmPassword: '비밀번호 확인',
    confirmPasswordPlaceholder: '비밀번호 확인',
    processing: '처리 중...',
    signIn: '로그인',
    createAccount: '새 계정 등록',
    passwordsDoNotMatch: '비밀번호가 일치하지 않습니다'
  },
  switch: {
    noAccount: "아직 계정이 없으신가요?",
    signUp: '회원가입',
    redeemCode: '팀원 전용 코드 입력',
    forgotPassword: '비밀번호를 잊으셨나요?',
    reset: '재설정',
    haveAccount: '이미 계정이 있으신가요?',
    signIn: '로그인',
    termsText: 'Molecular Universe를 사용함으로써, 귀하는 SES AI의 ',
    termsLink: '이용 약관에 동의하는 것으로 간주됩니다'
  },
  messages: {
    verificationSent: '인증 이메일이 발송되었습니다.',
    emailAddressDenied: "Molecular Universe 서비스를 제공할 수 없습니다. 이유: 당신 또는 관련 조직이 미국 무역 부, 국무부 또는 재무부의（U.S. Department of Commerce,U.S. Department of State,U.S. Department of the Treasury） 일부 목록（Entity List）에 포함되어 있습니다."
  },
  verifyCode: {
    header: {
      title: '인증 코드 확인',
      subtitle: '받으신 인증 코드를 입력해주세요'
    },
    form: {
      code: '인증 코드',
      codePlaceholder: '6자리 코드를 입력하세요',
      verify: '확인',
      processing: '확인 중...'
    },
    messages: {
      success: '인증 성공!',
      failed: '인증 실패, 코드가 올바른지 확인해주세요',
      expired: '인증 코드가 만료되었습니다. 새로운 코드를 요청해주세요',
      invalidCode: '잘못된 코드 형식입니다. 6자리 숫자를 입력해주세요',
      invalidLink: '유효하지 않은 인증 링크',
      redirecting: '로그인 페이지로 이동 중...'
    },
    switch: {
      backToLogin: '로그인으로 돌아가기'
    }
  },
  logo: {
    alt: 'SES AI 로고'
  },
  redeem: {
    header: {
      title: '팀 코드 사용',
      subtitle: 'Molecular Universe 플랫폼에서 귀하의 팀에 참여해 보세요'
    },
    form: {
      firstName: '이름',
      lastName: '성',
      username: '사용자명',
      email: '이메일 주소',
      emailPlaceholder: '이메일 주소',
      teamCode: '팀 코드',
      teamCodePlaceholder: '팀 코드를 입력하세요',
      processing: '처리 중...',
      redeemCode: '코드 사용하기'
    },
    messages: {
      defaultSuccess: '계정이 성공적으로 생성되었습니다. 임시 비밀번호는 받은 편지함을 확인하세요.',
      defaultError: '바우처 사용에 실패했습니다'
    },
    switch: {
      haveAccount: '이미 계정이 있으신가요?',
      signIn: '로그인'
    }
  },
  forgotPassword: {
    header: {
      title: '비밀번호 찾기',
      subtitle: '비밀번호를 재설정하려면 정보를 입력하세요'
    },
    form: {
      firstName: '이름',
      lastName: '성',
      email: '이메일 주소',
      emailPlaceholder: '이메일 주소',
      processing: '처리 중...',
      resetPassword: '비밀번호 재설정'
    },
    messages: {
      defaultSuccess: '입력하신 정보가 저희 기록과 일치하면 비밀번호 재설정 이메일이 발송됩니다.',
      defaultError: '비밀번호 재설정 요청에 실패했습니다'
    },
    switch: {
      rememberedPassword: '비밀번호가 기억나셨나요?',
      signIn: '로그인'
    }
  },
  passwordReset: {
    header: {
      title: '비밀번호 재설정',
      subtitle: '현재 비밀번호와 새 비밀번호를 입력해 주세요.'
    },
    form: {
      currentPassword: '현재 비밀번호',
      currentPasswordPlaceholder: '현재 비밀번호',
      newPassword: '새 비밀번호',
      newPasswordPlaceholder: '새 비밀번호',
      confirmPassword: '새 비밀번호 확인',
      confirmPasswordPlaceholder: '새 비밀번호 확인',
      processing: '재설정 중...',
      resetPassword: '비밀번호 재설정'
    },
    messages: {
      passwordsNotMatch: '새 비밀번호가 일치하지 않습니다',
      passwordTooShort: '새 비밀번호는 최소 6자 이상이어야 합니다',
      defaultError: '비밀번호 재설정에 실패했습니다',
      defaultSuccess: '비밀번호가 성공적으로 재설정되었습니다'
    }
  }
}; 