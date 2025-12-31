// app/api/sendEmail/route.js
// 
// SMTP Configuration (.env):
//   SMTP_HOST - SMTP server host
//   SMTP_PORT - SMTP port (default: 465)
//   SMTP_SECURE - "true" for SSL (default: false)
//   SMTP_USER - email address for sending
//   SMTP_PASS - email password
//
// Testing Mode (.env):
//   EMAIL_TESTING=true - enables testing mode (emails only go to test address)
//   EMAIL_TEST_ADDRESS - test email (default: cars@bbqr.site)
//
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email signature constants (using theme colors)
const EMAIL_SIGNATURE_HTML = `
<div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
  <div style="text-align: center; font-size: 13px; color: #616161; line-height: 1.8;">
    <div style="margin-bottom: 8px;">
      <strong style="color: #890000; font-size: 14px;">BBQR Support</strong>
    </div>
    <div style="color: #757575; margin-bottom: 12px;">
      Smart QR menus & waiter call system for restaurants
    </div>
    <div style="margin-top: 16px;">
      <a href="https://www.bbqr.site" style="color: #008989; text-decoration: none; margin: 0 12px;">
        🌐 www.bbqr.site
      </a>
      <span style="color: #bdbdbd;">|</span>
      <a href="mailto:support@bbqr.site" style="color: #008989; text-decoration: none; margin: 0 12px;">
        ✉️ support@bbqr.site
      </a>
    </div>
  </div>
</div>`;

const EMAIL_SIGNATURE_TEXT = `--

BBQR Support
Smart QR menus & waiter call system for restaurants

Website: https://www.bbqr.site
Email: support@bbqr.site`;

// Helper function to create beautiful HTML email template
function createEmailHTML(title, message) {
  // Theme colors
  const colors = {
    primary: "#890000",      // Тёмно-красный
    secondary: "#008989",    // Бирюзовый
    background: "#ffffff",    // Белый фон
    text: "#1a1a1a",         // Тёмный текст
    textSecondary: "#616161", // Серый текст
    border: "#e0e0e0",       // Светлая граница
    accent: "#894500",       // Коричнево-оранжевый
  };

  // Format message - preserve line breaks and structure
  const formattedMessage = message
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '<div style="height: 8px;"></div>'; // Spacing for empty lines
      
      // Check if line is a label (ends with :)
      if (trimmed.endsWith(':')) {
        return `<div style="margin: 16px 0 8px 0;"><strong style="color: ${colors.primary}; font-size: 15px;">${trimmed}</strong></div>`;
      }
      
      // Check if line contains key information (dates, prices, etc.)
      if (trimmed.includes('Бронь') || trimmed.includes('Сумма') || trimmed.includes('дней')) {
        return `<div style="margin: 8px 0; padding: 8px 12px; background-color: #f5f5f5; border-left: 3px solid ${colors.secondary}; border-radius: 4px;"><span style="color: ${colors.text}; line-height: 1.6;">${trimmed}</span></div>`;
      }
      
      // Regular text
      return `<div style="margin: 8px 0; color: ${colors.text}; line-height: 1.6;">${trimmed}</div>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Content Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${colors.background}; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
                ${title}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; max-width: 520px; margin: 0 auto;">
                ${formattedMessage}
              </div>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              ${EMAIL_SIGNATURE_HTML}
            </td>
          </tr>
          
        </table>
        
        <!-- Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 20px; color: ${colors.textSecondary}; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Natali Cars. All rights reserved.</p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// SMTP transporter with lazy initialization
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
      process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error(
        "Missing SMTP configuration. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables."
      );
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function POST(request) {
  try {
    // Check testing mode
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_TESTING, EMAIL_TEST_ADDRESS } = process.env;
    const isTestingMode = EMAIL_TESTING === "true";
    const testEmail = EMAIL_TEST_ADDRESS || "cars@bbqr.site";

    console.log("SMTP Config check:", {
      hasHost: !!SMTP_HOST,
      hasUser: !!SMTP_USER,
      hasPass: !!SMTP_PASS,
      host: SMTP_HOST || "NOT SET",
      testingMode: isTestingMode,
      testEmail: isTestingMode ? testEmail : "N/A",
    });

    // Get transporter (will throw if config is missing)
    const emailTransporter = getTransporter();

    const body = await request.json();
    const { email, emailCompany, title, message } = body;
    
    // In testing mode, override recipients to test email only
    const actualRecipient = isTestingMode ? testEmail : emailCompany;
    const actualCustomerEmail = isTestingMode ? null : email; // Don't send to customer in testing mode
    
    console.log("Email request:", {
      originalTo: emailCompany,
      actualTo: actualRecipient,
      customerEmail: isTestingMode ? "DISABLED (testing mode)" : (email || "not provided"),
      subject: title,
      messageLength: message?.length || 0,
      testingMode: isTestingMode,
    });

    if (!emailCompany || !title || !message) {
      return NextResponse.json(
        { error: "Missing required email data (emailCompany, title, message)." },
        { status: 400 }
      );
    }

    // Prepare text message with signature
    const messageWithSignature = `${message}\n\n${EMAIL_SIGNATURE_TEXT}`;
    
    // Prepare beautiful HTML email with theme colors and centered layout
    const htmlEmail = createEmailHTML(title, message);

    // Determine recipients: 
    // - In testing mode: only send to test email
    // - In production: send to company email, optionally to customer email
    let recipients;
    if (isTestingMode) {
      recipients = [testEmail];
    } else {
      recipients = actualCustomerEmail && actualCustomerEmail.trim() 
        ? [actualRecipient, actualCustomerEmail.trim()] 
        : [actualRecipient];
    }

    // Get SMTP_USER for from/replyTo
    const { SMTP_USER } = process.env;

    // In testing mode, prefix subject with [TEST]
    const emailSubject = isTestingMode ? `[TEST] ${title}` : title;

    const mailOptions = {
      from: `Natali Cars <${SMTP_USER}>`,
      to: recipients,
      replyTo: SMTP_USER,
      subject: emailSubject,
      text: messageWithSignature,
      html: htmlEmail,
    };

    console.log("Sending email with mailOptions:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await emailTransporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
    });

    return NextResponse.json(
      { 
        status: "Email sent", 
        messageId: info.messageId,
        accepted: info.accepted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Full error:", error);
    return NextResponse.json(
      { 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }, 
      { status: 500 }
    );
  }
}
