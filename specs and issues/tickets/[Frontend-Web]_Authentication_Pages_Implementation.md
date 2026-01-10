# [Frontend-Web] Authentication Pages Implementation

## Overview
Implement complete authentication flow for the web application including login, signup, password reset, and email verification pages.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web Implementation - Authentication Section)

Authentication pages are the entry point for therapists to access TherapyFlow. The design should be clean, professional, and mobile-responsive.

## Pages to Implement

### 1. Login Page (`app/(auth)/login/page.tsx`)
```wireframe
┌─────────────────────────────────────┐
│         TherapyFlow Logo            │
│                                     │
│   Welcome Back                      │
│   Sign in to your account           │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Email                       │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Password              [👁]  │  │
│   └─────────────────────────────┘  │
│                                     │
│   [ ] Remember me                   │
│                      Forgot password?│
│                                     │
│   ┌─────────────────────────────┐  │
│   │      Sign In                │  │
│   └─────────────────────────────┘  │
│                                     │
│   Don't have an account? Sign up   │
└─────────────────────────────────────┘
```

**Features:**
- Email and password fields with validation
- Show/hide password toggle
- Remember me checkbox
- Forgot password link
- Sign up link
- Loading state during authentication
- Error messages for invalid credentials
- Redirect to dashboard on success

### 2. Signup Page (`app/(auth)/signup/page.tsx`)
```wireframe
┌─────────────────────────────────────┐
│         TherapyFlow Logo            │
│                                     │
│   Create Your Account               │
│   Start your 14-day free trial      │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Full Name                   │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Email                       │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Password              [👁]  │  │
│   └─────────────────────────────┘  │
│   • Min 8 characters                │
│   • 1 uppercase letter              │
│   • 1 number                        │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ License Number (Optional)   │  │
│   └─────────────────────────────┘  │
│                                     │
│   [ ] I agree to Terms & Privacy   │
│                                     │
│   ┌─────────────────────────────┐  │
│   │      Create Account         │  │
│   └─────────────────────────────┘  │
│                                     │
│   Already have an account? Sign in │
└─────────────────────────────────────┘
```

**Features:**
- Form validation with Zod schema
- Real-time password strength indicator
- Terms and privacy policy checkbox
- Email verification flow
- Organization creation on first signup
- Redirect to onboarding after signup

### 3. Password Reset Page (`app/(auth)/reset-password/page.tsx`)
```wireframe
┌─────────────────────────────────────┐
│         TherapyFlow Logo            │
│                                     │
│   Reset Your Password               │
│   Enter your email to receive       │
│   a reset link                      │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Email                       │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │      Send Reset Link        │  │
│   └─────────────────────────────┘  │
│                                     │
│   ← Back to login                   │
└─────────────────────────────────────┘
```

**Features:**
- Email input with validation
- Success message after sending
- Resend link functionality
- Back to login link

### 4. Update Password Page (`app/(auth)/update-password/page.tsx`)
```wireframe
┌─────────────────────────────────────┐
│         TherapyFlow Logo            │
│                                     │
│   Set New Password                  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ New Password          [👁]  │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Confirm Password      [👁]  │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │      Update Password        │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Technical Requirements

### 1. Form Validation with Zod
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  licenseNumber: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms')
});
```

### 2. React Hook Form Integration
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});
```

### 3. Supabase Auth Integration
```typescript
async function handleLogin(data: LoginFormData) {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  
  if (error) {
    toast.error(error.message);
    return;
  }
  
  router.push('/dashboard');
}
```

### 4. Loading States
- Disable form during submission
- Show spinner on submit button
- Prevent double submission

### 5. Error Handling
- Display field-level errors
- Show toast notifications for auth errors
- Handle network errors gracefully

### 6. Responsive Design
- Mobile-first approach
- Centered layout on desktop
- Touch-friendly input fields
- Proper keyboard navigation

## Acceptance Criteria
- [ ] Login page implemented with validation
- [ ] Signup page implemented with validation
- [ ] Password reset flow working end-to-end
- [ ] Update password page working
- [ ] Email verification flow tested
- [ ] Form validation working with Zod
- [ ] Loading states implemented
- [ ] Error messages displayed correctly
- [ ] Responsive design on mobile and desktop
- [ ] Keyboard navigation working
- [ ] Password visibility toggle working
- [ ] Remember me functionality working
- [ ] Redirects working correctly
- [ ] Toast notifications for success/error

## Dependencies
- Requires: Next.js Web App Setup
- Requires: Authentication System Implementation

## Estimated Effort
6-8 hours