const { google } = require('googleapis');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
function getEnv(key) {
  const line = env.split('\n').find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].replace(/"/g, '') : null;
}

const CLIENT_ID = getEnv('GMAIL_CLIENT_ID');
const CLIENT_SECRET = getEnv('GMAIL_CLIENT_SECRET');
const REFRESH_TOKEN = getEnv('GMAIL_REFRESH_TOKEN');

async function run() {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmailClient.users.messages.list({
    userId: 'me',
    q: 'from:no-reply@famapp.in',
    maxResults: 1
  });

  if (!res.data.messages || res.data.messages.length === 0) {
    console.log('No messages found');
    return;
  }

  const msgId = res.data.messages[0].id;
  const messageData = await gmailClient.users.messages.get({
    userId: 'me',
    id: msgId,
    format: 'full',
  });

  const payload = messageData.data.payload;
  
  function getPartData(parts, mimeType) {
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      if (part.parts) {
        const found = getPartData(part.parts, mimeType);
        if (found) return found;
      }
    }
    return '';
  }

  let html = '';
  let plain = '';
  if (payload?.parts) {
    html = getPartData(payload.parts, 'text/html');
    plain = getPartData(payload.parts, 'text/plain');
  } else if (payload?.body?.data) {
    if (payload.mimeType === 'text/html') {
      html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else {
      plain = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
  }

  console.log("=== PLAIN TEXT ===");
  console.log(plain);
  console.log("=== HTML TEXT ===");
  console.log(html);
}

run().catch(console.error);
