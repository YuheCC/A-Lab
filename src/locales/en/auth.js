export default {
  header: {
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    signInSubtitle: 'Sign in to access the Molecular Universe',
    signUpSubtitle: 'Join the Molecular Universe community'
  },
  form: {
    firstName: 'First Name',
    lastName: 'Last Name',
    organizationName: 'Organization Name',
    username: 'Username',
    email: 'Email Address',
    emailPlaceholder: 'Email address',
    password: 'Password',
    passwordPlaceholder: 'Password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm password',
    processing: 'Processing...',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    passwordsDoNotMatch: 'Passwords do not match'
  },
  switch: {
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    redeemCode: 'Redeem code for team members',
    forgotPassword: 'Forgot password?',
    reset: 'Reset',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    termsText: 'By using Molecular Universe, you agree to SES AI\'s',
    termsLink: 'Terms and Conditions'
  },
  messages: {
    verificationSent: 'Verification e‑mail sent.',
    emailAddressDenied: "Unfortunately we are unable to provide you with the Molecular Universe service as you or your affiliated entity falls under one or more of the US Department of Commerce, State and Treasury's screening lists."
  },
  verifyCode: {
    header: {
      title: 'Verify Code',
      subtitle: 'Please enter the verification code you received'
    },
    form: {
      code: 'Verification Code',
      codePlaceholder: 'Enter 6-digit code',
      verify: 'Verify',
      processing: 'Verifying...'
    },
    messages: {
      success: 'Verification successful!',
      failed: 'Verification failed, please check if the code is correct',
      expired: 'Verification code has expired, please request a new one',
      invalidCode: 'Invalid code format, please enter 6 digits',
      invalidLink: 'Invalid verification link',
      redirecting: 'Redirecting to login page...'
    },
    switch: {
      backToLogin: 'Back to Login'
    }
  },
  logo: {
    alt: 'SES AI Logo'
  },
  redeem: {
    header: {
      title: 'Redeem Team Code',
      subtitle: 'Join your team on the Molecular Universe platform'
    },
    form: {
      firstName: 'First Name',
      lastName: 'Last Name',
      username: 'Username',
      email: 'Email Address',
      emailPlaceholder: 'Email address',
      teamCode: 'Team Code',
      teamCodePlaceholder: 'Enter your team code',
      processing: 'Processing...',
      redeemCode: 'Redeem Code'
    },
    messages: {
      defaultSuccess: 'Account created successfully. Check your inbox for a temporary password.',
      defaultError: 'Voucher redemption failed'
    },
    switch: {
      haveAccount: 'Already have an account?',
      signIn: 'Sign In'
    }
  },
  forgotPassword: {
    header: {
      title: 'Forgot Password',
      subtitle: 'Enter your details to reset your password'
    },
    form: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      emailPlaceholder: 'Email address',
      processing: 'Processing...',
      resetPassword: 'Reset Password'
    },
    messages: {
      defaultSuccess: 'If your information matches our records, a password reset email will be sent.',
      defaultError: 'Password reset request failed'
    },
    switch: {
      rememberedPassword: 'Remembered your password?',
      signIn: 'Sign In'
    }
  },
  passwordReset: {
    header: {
      title: 'Reset Password',
      subtitle: 'Please enter your current password and a new password'
    },
    form: {
      currentPassword: 'Current Password',
      currentPasswordPlaceholder: 'Current password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'New password',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Confirm new password',
      processing: 'Resetting...',
      resetPassword: 'Reset Password'
    },
    messages: {
      passwordsNotMatch: 'New passwords do not match',
      passwordTooShort: 'New password must be at least 6 characters long',
      defaultError: 'Password reset failed',
      defaultSuccess: 'Password reset successfully'
    }
  }
}; 