# LoginModal Component

A login modal component based on the existing login page design, used to replace page-redirect login functionality.

## Features

- 🎨 **Unified Design**: Based on original login page styles, maintaining design consistency
- 🔒 **Complete Authentication**: Supports username/password login, terms agreement, error handling
- 📱 **Responsive**: Adapts to mobile and desktop devices
- 🌐 **Internationalization**: Full support for i18next multi-language
- ♿ **Accessibility**: Supports keyboard navigation, screen readers, focus trap
- 🎯 **Redirect**: Supports custom redirect path after login
- ⌨️ **Keyboard Friendly**: ESC key to close, Tab key cycling focus, auto focus
- 🔒 **Focus Management**: Auto-focus on username input when opened

## Usage Examples

### 🌟 Recommended Usage - Using Context (Globally Integrated)

```tsx
import { useLoginModal } from '@/components/LoginModal/hooks';

const MyComponent = () => {
  const { openLoginModal } = useLoginModal();

  return (
    <div>
      <button onClick={() => openLoginModal('/dashboard')}>
        Login
      </button>
      {/* No need to include LoginModal component, already globally integrated in layout */}
    </div>
  );
};
```

### Authentication Check

```tsx
import { useLoginModal } from '@/components/LoginModal/hooks';

const ProtectedComponent = () => {
  const { requireAuth, withAuth } = useLoginModal();

  // Method 1: Manual check
  const handleProtectedAction = () => {
    if (requireAuth('/protected-page')) {
      // Execute protected operation
      console.log('Executing protected operation');
    }
  };

  // Method 2: Decorator pattern
  const protectedAction = withAuth(() => {
    console.log('Executing protected operation');
  }, '/protected-page');

  return (
    <div>
      <button onClick={handleProtectedAction}>Protected Action</button>
      <button onClick={protectedAction}>Decorator Pattern</button>
    </div>
  );
};
```

### Traditional Usage (Not Recommended, but Still Available)

```tsx
import { useState } from 'react';
import LoginModal from '@/components/LoginModal';

const MyComponent = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLoginModal(true)}>
        Login
      </button>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectPath="/dashboard"
      />
    </div>
  );
};
```

## API Reference

### LoginModal Props

```tsx
interface LoginModalProps {
  isOpen: boolean;        // Controls modal show/hide
  onClose: () => void;    // Callback function to close modal
  redirectPath?: string;  // Optional: redirect path after successful login
}
```

### useLoginModal Hook

```tsx
interface LoginModalHook {
  // Context original methods
  isOpen: boolean;                           // Whether modal is open
  redirectPath?: string;                     // Redirect path
  openLoginModal: (redirectPath?: string) => void;  // Open login modal
  closeLoginModal: () => void;               // Close login modal
  
  // Enhanced methods
  requireAuth: (redirectPath?: string) => boolean;   // Check authentication status
  withAuth: <T>(action: T, redirectPath?: string) => T; // Permission decorator
  isAuthenticated: boolean;                  // Current authentication status
}
```

## Style Customization

The component uses an independent CSS file `LoginModal.css` that mainly includes:

- Modal overlay and container
- Form styles (input fields, buttons, checkboxes)
- Responsive layout
- Animation effects
- Accessibility support

To customize styles, you can:

1. Directly modify `LoginModal.css`
2. Override theme colors through CSS variables
3. Add custom class names

## Internationalization Support

The component uses existing authentication-related translation keys:

- `auth.header.welcomeBack`
- `auth.form.username`
- `auth.form.password`
- `auth.switch.loginTermsText`
- And more...

Ensure related translation files are properly configured.

## 🚀 Quick Start

1. **Globally Integrated**: LoginModal is already integrated in `layouts/index.tsx`, no need to add it again
2. **Unified Management**: All LoginModal related files are unified in `@/components/LoginModal/` directory
3. **Use Hook**: Recommended to use `useLoginModal` Hook for simplified usage
4. **Replace Login Redirect**: Replace existing `navigate('/login')` with `openLoginModal()`

### Migration Guide

```tsx
// ❌ Old way - Page redirect
const handleLogin = () => {
  navigate('/login?redirect=' + pathname);
};

// ✅ New way - Using modal
const { openLoginModal } = useLoginModal();
const handleLogin = () => {
  openLoginModal(pathname);
};
```

## 🔗 Authentication System Integration

LoginModal is deeply integrated with the project's authentication system (`useAuth`):

### Auto-popup Scenarios

1. **When `verifyAuth` fails**: Automatically pops up login modal instead of redirecting to login page
2. **After `logout`**: Automatically pops up login modal to prompt re-login
3. **When `ProtectedRoute` intercepts**: Protected routes automatically pop up login modal

### Seamless Integration

```tsx
// ✅ These operations now automatically pop up login modal, no manual handling needed
const { verifyAuth, logout } = useAuthStore();

// Verification failure will automatically pop up login modal
await verifyAuth();

// After logout will automatically pop up login modal
await logout();
```

## Integration Recommendations

1. **Zero Configuration**: Authentication system is automatically integrated, no additional configuration needed
2. **Permission Interception**: Use `requireAuth` and `withAuth` to simplify permission checks
3. **Business Integration**: Integrate permission checks in existing features like add to favorites, advanced search, etc.
4. **Route Protection**: `ProtectedRoute` now pops up modal instead of redirecting to page

## Notes

- Component automatically handles form reset and error cleanup
- Automatically closes modal and redirects after successful login
- Supports ESC key to close modal (cannot close during loading state)
- Disables all interactive elements during loading state
- Auto-focuses on username input when opened for better user experience
- Complete focus trap, Tab key navigation won't escape the modal
- Prevents page scrolling when modal is open, restores when closed

## Keyboard Interactions

- **ESC Key**: Close modal (non-loading state)
- **Tab Key**: Cycle through focusable elements
- **Shift+Tab**: Reverse cycle navigation
- **Enter Key**: Submit form (when in input field)
- **Space Key**: Toggle checkbox state

## Accessibility Support

- Proper ARIA labels and role attributes
- Full keyboard navigation support
- Screen reader friendly
- High contrast focus indicators
- Semantic HTML structure
