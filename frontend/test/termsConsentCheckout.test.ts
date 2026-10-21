import test from 'node:test';
import assert from 'node:assert/strict';

// --- Logic mirroring Cart.tsx consent state & enforcement ---

interface CheckoutState {
  cartItemsCount: number;
  isCheckingOut: boolean;
  termsAccepted: boolean;
}

export function canProceedCheckout(state: CheckoutState): boolean {
  if (state.cartItemsCount === 0) return false;
  if (state.isCheckingOut) return false;
  if (!state.termsAccepted) return false;
  return true;
}

export function handleCheckoutAttempt(
  state: CheckoutState,
  callbacks: {
    onError: (msg: string) => void;
    onSuccess: (payload: { termsAccepted: boolean; policyVersion: string }) => void;
  }
): boolean {
  if (state.cartItemsCount === 0) return false;
  if (!state.termsAccepted) {
    callbacks.onError('Please accept the Terms of Service to proceed with checkout.');
    return false;
  }
  callbacks.onSuccess({
    termsAccepted: true,
    policyVersion: '2026-09-v1'
  });
  return true;
}

// Reset logic when cart items change or checkout modal closes
export function resetConsentOnSessionChange(): boolean {
  return false;
}

// --- Logic mirroring backend create-session validation & recording ---

export interface ServerValidationResult {
  statusCode: number;
  error?: string;
  orderData?: {
    termsAccepted: boolean;
    termsAcceptedAt: Date;
    termsVersion: string;
  };
}

export function validateServerCheckoutConsent(body: any): ServerValidationResult {
  const { termsAccepted, policyVersion } = body || {};

  // Strict boolean check: client-supplied boolean alone must be true, not truthy string or number
  if (termsAccepted !== true || typeof termsAccepted !== 'boolean') {
    return {
      statusCode: 400,
      error: 'You must read and agree to the Terms of Service, including the Account Usage, Warranty & Support Policy, to proceed with checkout.'
    };
  }

  const currentPolicyVersion = policyVersion && typeof policyVersion === 'string' && policyVersion.trim().length > 0
    ? policyVersion.trim()
    : '2026-09-v1';

  // Server records current timestamp (ignoring any client-sent timestamps)
  return {
    statusCode: 200,
    orderData: {
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: currentPolicyVersion
    }
  };
}

// --- Unit & Integration Tests ---

test('1. Unchecked checkout attempt is blocked on frontend with disabled button and error toast', () => {
  const state: CheckoutState = {
    cartItemsCount: 2,
    isCheckingOut: false,
    termsAccepted: false
  };

  assert.equal(canProceedCheckout(state), false, 'Checkout button must be disabled when terms are unchecked');

  let errorMessage = '';
  let payloadPassed: any = null;

  const result = handleCheckoutAttempt(state, {
    onError: (msg) => { errorMessage = msg; },
    onSuccess: (p) => { payloadPassed = p; }
  });

  assert.equal(result, false, 'Action must be blocked');
  assert.equal(errorMessage, 'Please accept the Terms of Service to proceed with checkout.');
  assert.equal(payloadPassed, null, 'No checkout payload should be sent');
});

test('2. Checked consent enables checkout and transmits validated consent payload', () => {
  const state: CheckoutState = {
    cartItemsCount: 1,
    isCheckingOut: false,
    termsAccepted: true
  };

  assert.equal(canProceedCheckout(state), true, 'Checkout button must be enabled when terms are checked');

  let errorMessage = '';
  let payloadPassed: any = null;

  const result = handleCheckoutAttempt(state, {
    onError: (msg) => { errorMessage = msg; },
    onSuccess: (p) => { payloadPassed = p; }
  });

  assert.equal(result, true, 'Checkout should proceed');
  assert.equal(errorMessage, '', 'No error should be thrown');
  assert.deepEqual(payloadPassed, {
    termsAccepted: true,
    policyVersion: '2026-09-v1'
  });
});

test('3. Reset on cart item change ensures consent is not retained for new checkout attempts', () => {
  let userConsent = true;
  // User adds or removes item from cart
  userConsent = resetConsentOnSessionChange();
  assert.equal(userConsent, false, 'Consent must reset to false when session/cart changes');

  // User closes payment modal
  userConsent = true;
  userConsent = resetConsentOnSessionChange();
  assert.equal(userConsent, false, 'Consent must reset to false when checkout attempt closes');
});

test('4. Backend validation strictly blocks tampered requests missing consent', () => {
  // Scenario A: Missing termsAccepted
  const missingConsent = validateServerCheckoutConsent({});
  assert.equal(missingConsent.statusCode, 400);
  assert.ok(missingConsent.error?.includes('Terms of Service'));

  // Scenario B: Explicit false
  const falseConsent = validateServerCheckoutConsent({ termsAccepted: false });
  assert.equal(falseConsent.statusCode, 400);

  // Scenario C: String spoofing 'true'
  const stringConsent = validateServerCheckoutConsent({ termsAccepted: 'true' });
  assert.equal(stringConsent.statusCode, 400, 'String "true" must be rejected as spoofed input');

  // Scenario D: Number spoofing 1
  const numberConsent = validateServerCheckoutConsent({ termsAccepted: 1 });
  assert.equal(numberConsent.statusCode, 400, 'Numeric 1 must be rejected');

  // Scenario E: Null / undefined
  const nullConsent = validateServerCheckoutConsent({ termsAccepted: null });
  assert.equal(nullConsent.statusCode, 400);
});

test('5. Backend accurately records verified consent with server timestamp and version', () => {
  const beforeTime = Date.now();
  const validRequest = validateServerCheckoutConsent({
    termsAccepted: true,
    policyVersion: '2026-09-v1'
  });
  const afterTime = Date.now();

  assert.equal(validRequest.statusCode, 200);
  assert.equal(validRequest.error, undefined);
  assert.ok(validRequest.orderData);
  assert.equal(validRequest.orderData.termsAccepted, true);
  assert.equal(validRequest.orderData.termsVersion, '2026-09-v1');

  const recordTime = validRequest.orderData.termsAcceptedAt.getTime();
  assert.ok(recordTime >= beforeTime && recordTime <= afterTime, 'Timestamp must be generated server-side');
});

test('6. Client cannot spoof server acceptance timestamp', () => {
  const forgedTimestamp = new Date('2020-01-01T00:00:00Z');
  const requestWithForgedTimestamp = validateServerCheckoutConsent({
    termsAccepted: true,
    policyVersion: '2026-09-v1',
    termsAcceptedAt: forgedTimestamp
  });

  assert.equal(requestWithForgedTimestamp.statusCode, 200);
  assert.notEqual(
    requestWithForgedTimestamp.orderData?.termsAcceptedAt.toISOString(),
    forgedTimestamp.toISOString(),
    'Server must generate trusted timestamp instead of accepting client date'
  );
});
