const nodemailer = require("nodemailer");
const axios = require("axios");

const getClientBaseUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

const getServerBaseUrl = () =>
  (
    process.env.SERVER_URL ||
    process.env.API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendBrevoEmail = async (payload) => {
  console.log("BREVO PAYLOAD:");
  console.log(JSON.stringify(payload, null, 2));

  await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
  });
};

const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT),
      secure: false,

      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${getClientBaseUrl()}/reset-password/${resetToken}`;

  // Development -> Gmail (Nodemailer)
  if (process.env.NODE_ENV !== "production") {
    const transporter = createTransporter();

    return await transporter.sendMail({
      from: `Boseth Traders <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Boseth Traders password",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #10B981; font-weight: 700;">Boseth Traders</p>
            <h2 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: #0f172a;">Reset your password</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #475569;">We received a request to reset the password for your Boseth Traders account. Use the secure button below to continue.</p>
            <p style="margin: 0 0 24px;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700;">Reset Password</a>
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">For your security, this link expires in 1 hour. If you did not request this change, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });
  }

  console.log("EMAIL_USER =", process.env.EMAIL_USER);
  // Production -> Brevo API
  await sendBrevoEmail({
    sender: {
      name: "Boseth Traders",
      email: process.env.EMAIL_USER,
    },

    to: [
      {
        email,
      },
    ],

    subject: "Reset your Boseth Traders password",

    htmlContent: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #10B981; font-weight: 700;">Boseth Traders</p>
          <h2 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: #0f172a;">Reset your password</h2>
          <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #475569;">We received a request to reset the password for your Boseth Traders account. Use the secure button below to continue.</p>
          <p style="margin: 0 0 24px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700;">Reset Password</a>
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">For your security, this link expires in 1 hour. If you did not request this change, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

const sendDiscountNotificationEmail = async ({ to, bcc, subject, html }) => {
  const unsubscribeUrl = `${getServerBaseUrl()}/api/subscribers/unsubscribe?email=${encodeURIComponent(to)}`;

  if (process.env.NODE_ENV === "production") {
    await sendBrevoEmail({
      sender: {
        name: "Boseth Traders",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      bcc: bcc ? [{ email: bcc }] : undefined,
      subject,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
      },
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            ${html}
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 8px;">You are receiving this email because you subscribed to offers from Boseth Traders.</p>
              <p style="margin: 0;">To stop promotional emails, <a href="${unsubscribeUrl}" style="color: #059669; font-weight: 700; text-decoration: none;">unsubscribe instantly</a>.</p>
            </div>
          </div>
        </div>
      `,
    });

    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `Boseth Traders <${process.env.EMAIL_USER}>`,
    to,
    bcc,
    subject,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
    },
    html: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          ${html}
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; line-height: 1.6; color: #64748b;">
            <p style="margin: 0 0 8px;">You are receiving this email because you subscribed to offers from Boseth Traders.</p>
            <p style="margin: 0;">To stop promotional emails, <a href="${unsubscribeUrl}" style="color: #059669; font-weight: 700; text-decoration: none;">unsubscribe instantly</a>.</p>
          </div>
        </div>
      </div>
    `,
  });
};

const sendAdminMessageNotificationEmail = async ({
  to,
  messageCount,
  messages,
}) => {
  const dashboardUrl = `${getClientBaseUrl()}/admin/dashboard`;
  const previewMessages = messages.slice(0, 5);

  const messageRows = previewMessages.length
    ? previewMessages
        .map(
          (message) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(message.subject)}</div>
                <div style="margin-top: 4px; font-size: 13px; color: #64748b;">${escapeHtml(message.name || message.user?.name || "Customer")} ${message.email ? `&lt;${escapeHtml(message.email)}&gt;` : ""}</div>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; text-align: right; color: #059669; font-weight: 600; text-transform: capitalize;">${escapeHtml(message.status)}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="2" style="padding: 16px 0; color: #64748b;">No customer messages currently require attention.</td>
      </tr>
    `;

  if (process.env.NODE_ENV === "production") {
    await sendBrevoEmail({
      sender: {
        name: "Boseth Traders System",
        email: process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      subject: `Customer messages need attention (${messageCount})`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #10B981; font-weight: 700;">Admin notification</p>
            <h2 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: #0f172a;">Customer messages require review</h2>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">There ${messageCount === 1 ? "is" : "are"} ${messageCount} customer message${messageCount === 1 ? "" : "s"} in new, pending, or in-progress status. Please review them in the admin dashboard.</p>
            <p style="margin: 0 0 24px;">
              <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700;">Open Admin Dashboard</a>
            </p>
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 0 0 12px; text-align: left; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;">Subject and sender</th>
                  <th style="padding: 0 0 12px; text-align: right; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${messageRows}
              </tbody>
            </table>
          </div>
        </div>
      `,
    });

    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `Boseth Traders System <${process.env.EMAIL_USER}>`,
    to,
    subject: `Customer messages need attention (${messageCount})`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px 16px; color: #1f2937;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
          <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #10B981; font-weight: 700;">Admin notification</p>
          <h2 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: #0f172a;">Customer messages require review</h2>
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">There ${messageCount === 1 ? "is" : "are"} ${messageCount} customer message${messageCount === 1 ? "" : "s"} in new, pending, or in-progress status. Please review them in the admin dashboard.</p>
          <p style="margin: 0 0 24px;">
            <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 700;">Open Admin Dashboard</a>
          </p>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 0 0 12px; text-align: left; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;">Subject and sender</th>
                <th style="padding: 0 0 12px; text-align: right; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${messageRows}
            </tbody>
          </table>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendDiscountNotificationEmail,
  sendAdminMessageNotificationEmail,
};
