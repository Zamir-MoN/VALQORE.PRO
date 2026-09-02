export interface ParsedEmailData {
  amount: number;
  sender: string;
  transactionId: string;
  date: string;
  utr: string;
  purpose: string;
}

export function parseFamAppEmail(text: string): ParsedEmailData | null {
  try {
    const cleanText = text.replace(/\r\n/g, '\n');

    // Extract Amount (e.g. ₹1.0 or ₹499)
    const amountMatch = cleanText.match(/₹([\d.]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Extract Sender (e.g. from MD ZISHAN MANDAL)
    const senderMatch = cleanText.match(/from\s+([^\n]+)/i);
    const sender = senderMatch ? senderMatch[1].trim() : '';

    // Extract Transaction ID
    const txMatch = cleanText.match(/Transaction ID\s*:\s*([a-zA-Z0-9]+)/i);
    const transactionId = txMatch ? txMatch[1].trim() : '';

    // Extract Date
    const dateMatch = cleanText.match(/Date\s*:\s*([^\n]+)/i);
    const date = dateMatch ? dateMatch[1].trim() : '';

    // Extract UTR
    const utrMatch = cleanText.match(/UTR\s*:\s*(\d+)/i);
    const utr = utrMatch ? utrMatch[1].trim() : '';

    // Extract Purpose
    const purposeMatch = cleanText.match(/Purpose\s*:\s*([^\n]+)/i);
    const purpose = purposeMatch ? purposeMatch[1].trim() : '';

    if (!amount || !utr || !transactionId) {
      return null;
    }

    return {
      amount,
      sender,
      transactionId,
      date,
      utr,
      purpose,
    };
  } catch (error) {
    console.error('Error parsing email:', error);
    return null;
  }
}
