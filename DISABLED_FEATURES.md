# Temporarily Disabled Features (Dev Phase)

This document tracks features that have been intentionally disabled or bypassed during the development phase to streamline testing and development. 

**Make sure to revert these changes before deploying to production.**

---

### 1. OTP Verification on Sign-Up
- **Status:** Disabled
- **Modified File:** `frontend/src/components/Auth.tsx` (around line 113)
- **Reason:** To avoid manually entering an OTP code every time a test account is created during development.
- **How it was bypassed:** 
  The frontend `handleSignup` function was modified to directly call the fallback `/api/auth/register` backend endpoint instead of `/api/auth/send-register-otp`, skipping the modal's `otp` step entirely.
- **How to re-enable for production:**
  Revert the `handleSignup` block in `Auth.tsx` back to:
  ```typescript
  try {
    const res = await axios.post(`${API_URL}/auth/send-register-otp`, { username, email });
    setSuccessMsg(res.data.message || 'OTP sent to your email!');
    setStep('otp');
    setResendCooldown(60);
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to send verification code');
  }
  ```
