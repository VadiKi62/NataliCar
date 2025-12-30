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

// Validate environment variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASS = process.env.GMAIL_APP_PASS;

if (!GMAIL_USER || !GMAIL_APP_PASS) {
  console.error("Missing email credentials in environment variables:");
  console.error("GMAIL_USER:", GMAIL_USER ? "✓ Set" : "✗ Missing");
  console.error("GMAIL_APP_PASS:", GMAIL_APP_PASS ? "✓ Set" : "✗ Missing");
}

// Create transporter using environment variables from .env (lines 16-20)
// Only create transporter if credentials are available
const transporter = GMAIL_USER && GMAIL_APP_PASS
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS,
      },
    })
  : null;

// Verify transporter only if it was created
if (transporter) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Email server verification error:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  });
} else {
  console.warn("Email transporter not initialized - missing credentials");
}

export async function POST(request) {
  try {
    // Check if transporter is initialized
    if (!transporter) {
      return NextResponse.json(
        { 
          error: "Email service not configured. Missing GMAIL_USER or GMAIL_APP_PASS environment variables.",
          details: "Please check your .env file and ensure GMAIL_USER and GMAIL_APP_PASS are set."
        },
        { status: 500 }
      );
    }

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

    const mailOptions = {
      from: `Natali Cars <${process.env.GMAIL_USER}>`,
      to: recipients,
      replyTo: process.env.GMAIL_USER,
      subject: title,
      text: messageWithSignature,
      html: htmlMessageWithSignature,
    };

    const info = await transporter.sendMail(mailOptions);

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
        details: error.stack,
      }, 
      { status: 500 }
    );
  }
}
