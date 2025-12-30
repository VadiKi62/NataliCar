// app/api/sendEmail/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email signature constants
const EMAIL_SIGNATURE_HTML = `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:30px 0;" />

<div style="font-size:14px;color:#ccc;line-height:1.6;">

  <strong style="color:#e2b543;">BBQR Support</strong><br/>

  Smart QR menus & waiter call system for restaurants<br/><br/>

  🌐 <a href="https://www.bbqr.site" style="color:#2896bb;text-decoration:none;">www.bbqr.site</a><br/>

  ✉️ <a href="mailto:support@bbqr.site" style="color:#2896bb;text-decoration:none;">support@bbqr.site</a>

</div>`;

const EMAIL_SIGNATURE_TEXT = `--

BBQR Support

Smart QR menus & waiter call system for restaurants



Website: https://www.bbqr.site

Email: support@bbqr.site`;

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
    // Get transporter (will throw if config is missing)
    const emailTransporter = getTransporter();

    const body = await request.json();
    const { email, emailCompany, title, message } = body;

    if (!emailCompany || !title || !message) {
      return NextResponse.json(
        { error: "Missing required email data (emailCompany, title, message)." },
        { status: 400 }
      );
    }

    // Prepare message with signature
    const messageWithSignature = `${message}\n\n${EMAIL_SIGNATURE_TEXT}`;
    
    // Prepare HTML message with signature (convert newlines to <br>)
    const htmlMessage = message
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<br/>')
      .join('');
    const htmlMessageWithSignature = `${htmlMessage}${EMAIL_SIGNATURE_HTML}`;

    // Determine recipients: always send to company email, optionally to customer email
    const recipients = email && email.trim() 
      ? [emailCompany, email.trim()] 
      : [emailCompany];

    // Get SMTP_USER for from/replyTo
    const { SMTP_USER } = process.env;

    const mailOptions = {
      from: `Natali Cars <${SMTP_USER}>`,
      to: recipients,
      replyTo: SMTP_USER,
      subject: title,
      text: messageWithSignature,
      html: htmlMessageWithSignature,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    console.log("Message ID:", info.messageId);

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
    return NextResponse.json(
      { 
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }, 
      { status: 500 }
    );
  }
}
