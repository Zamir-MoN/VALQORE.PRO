export const sendApprovalEmail = async (email: string, name: string) => {
  // Placeholder for real email sending logic (e.g., Nodemailer, AWS SES, SendGrid)
  console.log('====================================================');
  console.log(`[EMAIL NOTIFICATION] To: ${email}`);
  console.log(`Subject: Your Valqore Creator Application has been APPROVED!`);
  console.log(`Body:`);
  console.log(`Hello ${name},`);
  console.log(`\nCongratulations! Your Creator application has been approved.`);
  console.log(`This email address (${email}) has been approved for the Valqore Creator role.`);
  console.log(`\nWelcome to the team!\n- The Valqore Admin Team`);
  console.log('====================================================');
  
  // Return true to simulate a successful send
  return true;
};
