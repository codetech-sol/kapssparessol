import { createFileRoute } from "@tanstack/react-router";
import nodemailer from "nodemailer";

type LeadBody = {
  name?: string;
  email?: string;
  contactNumber?: string;
  initialMessage?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as LeadBody;

        const name = body.name?.trim();
        const email = body.email?.trim();
        const contactNumber = body.contactNumber?.trim();
        const initialMessage = body.initialMessage?.trim();

        if (!name || !email || !contactNumber || !initialMessage) {
          return jsonResponse({ error: "Name, email, contact number, and initial message are required." }, 400);
        }

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !adminEmail) {
          return jsonResponse(
            {
              error:
                "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and ADMIN_EMAIL.",
            },
            500,
          );
        }

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        try {
          await transporter.sendMail({
            from: smtpUser,
            to: adminEmail,
            replyTo: email,
            subject: `New chat lead from ${name}`,
            text: [
              "A new lead was submitted via the website chat.",
              "",
              `Name: ${name}`,
              `Email: ${email}`,
              `Contact Number: ${contactNumber}`,
              "",
              "Initial message:",
              initialMessage,
            ].join("\n"),
            html: `
              <h2>New chat lead</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Contact Number:</strong> ${contactNumber}</p>
              <p><strong>Initial message:</strong></p>
              <p>${initialMessage.replace(/\n/g, "<br>")}</p>
            `,
          });

          return jsonResponse({ success: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to send email.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
