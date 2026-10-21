"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUnreadEmails = fetchUnreadEmails;
exports.startGmailCron = startGmailCron;
const node_cron_1 = __importDefault(require("node-cron"));
const googleapis_1 = require("googleapis");
const parser_util_1 = require("../utils/parser.util");
const verification_service_1 = require("./verification.service");
const prismaClient_1 = require("../prismaClient");
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';
let gmailClient = null;
if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    gmailClient = googleapis_1.google.gmail({ version: 'v1', auth: oauth2Client });
}
async function fetchUnreadEmails() {
    if (!gmailClient)
        return;
    try {
        const res = await gmailClient.users.messages.list({
            userId: 'me',
            q: 'from:no-reply@famapp.in newer_than:1d',
        });
        const messages = res.data.messages || [];
        for (const msg of messages) {
            if (!msg.id)
                continue;
            const exists = await prismaClient_1.prisma.parsedEmail.findUnique({ where: { messageId: msg.id } });
            if (exists)
                continue;
            const messageData = await gmailClient.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full',
            });
            let bodyData = messageData.data.snippet || '';
            const payload = messageData.data.payload;
            function getPartData(parts, mimeType) {
                for (const part of parts) {
                    if (part.mimeType === mimeType && part.body?.data) {
                        return Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                    if (part.parts) {
                        const found = getPartData(part.parts, mimeType);
                        if (found)
                            return found;
                    }
                }
                return '';
            }
            let html = '';
            let plain = '';
            if (payload?.parts) {
                html = getPartData(payload.parts, 'text/html');
                plain = getPartData(payload.parts, 'text/plain');
            }
            else if (payload?.body?.data) {
                if (payload.mimeType === 'text/html') {
                    html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                }
                else {
                    plain = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                }
            }
            if (html) {
                bodyData = html.replace(/<[^>]*>?/gm, '\n');
            }
            else if (plain) {
                bodyData = plain;
            }
            const parsedData = (0, parser_util_1.parseFamAppEmail)(bodyData);
            if (parsedData) {
                await (0, verification_service_1.processPaymentEmail)(parsedData);
            }
            await prismaClient_1.prisma.parsedEmail.create({
                data: { messageId: msg.id }
            });
        }
    }
    catch (error) {
        console.error('Error fetching payment emails:', error);
    }
}
function startGmailCron() {
    if (process.env.ENABLE_GMAIL_CRON === 'true' && gmailClient) {
        console.log('[DELTA PAY] Starting Gmail Polling Cron Job (every 5 seconds)');
        node_cron_1.default.schedule('*/5 * * * * *', () => {
            fetchUnreadEmails();
        });
    }
}
//# sourceMappingURL=gmail.service.js.map