import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API = 'http://127.0.0.1:5005/api/auth';
const testUser = { username: 'testuser_otp', email: 'test_otp@example.com', password: 'password123' };

async function run() {
  console.log('--- TEST 1: Direct POST /register bypass (Should be 404) ---');
  const res1 = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  console.log('Status:', res1.status);
  
  if (res1.status === 201) {
     console.log('FAIL: Bypass still allowed!');
     await prisma.user.deleteMany({ where: { email: testUser.email } });
  }

  console.log('\n--- TEST 2: Send OTP (Should be 200) ---');
  const res2 = await fetch(`${API}/send-register-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  console.log('Status:', res2.status);

  if (res2.status === 200) {
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email: testUser.email }
    });
    console.log('OTP generated:', !!otpRecord);

    console.log('\n--- TEST 3: Verify with WRONG OTP (Should be 400) ---');
    const res3 = await fetch(`${API}/verify-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, otp: '000000' })
    });
    console.log('Status:', res3.status);

    console.log('\n--- TEST 4: Verify with CORRECT OTP (Should be 201) ---');
    const res4 = await fetch(`${API}/verify-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUser, otp: otpRecord.otp })
    });
    console.log('Status:', res4.status);

    if (res4.status === 201) {
      console.log('User successfully created and authenticated!');
    }
  }

  console.log('\n--- TEST 5: Check existing Google Login route (Should be 400, not 404) ---');
  const res5 = await fetch(`${API}/google`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}' });
  console.log('Status:', res5.status);

  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.otpVerification.deleteMany({ where: { email: testUser.email } });
}

run().finally(() => prisma.$disconnect());
