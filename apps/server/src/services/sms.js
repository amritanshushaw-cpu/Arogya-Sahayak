const twilio = require('twilio');

async function sendAlertSMS(patientName, riskLevel, doctorPhone) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS MOCK] Alert! High risk (${riskLevel}) detected for patient: ${patientName}. Twilio not configured.`);
    return;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `⚠️ ALERT: High risk (${riskLevel}) detected for patient ${patientName}. Please check dashboard immediately.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: doctorPhone
    });
    console.log(`[SMS] Alert sent successfully for patient: ${patientName}`);
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send SMS for patient: ${patientName}`, error.message);
  }
}

module.exports = {
  sendAlertSMS
};
