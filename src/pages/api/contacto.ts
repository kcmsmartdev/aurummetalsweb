import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    const nombre = data.get("nombre");
    const email = data.get("email");
    const telefono = data.get("telefono");
    const mensaje = data.get("mensaje");

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT),
      secure: true, // 🔑 porque usas 465
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    // Verifica conexión SMTP
    await transporter.verify();

    // Correo interno
    await transporter.sendMail({
      from: `Formulario Web <${import.meta.env.SMTP_USER}>`,
      to: "contacto@kenerdev.com",
      replyTo: email as string,
      subject:  `💻 Mensaje de ${nombre} `,
      html: `
  <div style="
    font-family: 'Montserrat', Arial, Helvetica, sans-serif;
    background-color: #0b0b0b;
    padding: 32px 16px;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    ">

      <!-- Header -->
      <div style="
        background-color: #000000;
        padding: 24px;
        text-align: center;
      ">
        <h1 style="
          margin: 0;
          font-size: 20px;
          letter-spacing: 1px;
          color: #CBA135;
          text-transform: uppercase;
          font-weight: 700;
        ">
          Aurum Metals
        </h1>
        <p style="
          margin: 8px 0 0;
          font-size: 12px;
          color: #d1d1d1;
          letter-spacing: 0.5px;
        ">
          Minería justa y responsable
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 28px 24px; color: #1a1a1a;">

        <h2 style="
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
          border-left: 4px solid #CBA135;
          padding-left: 12px;
        ">
          Nuevo mensaje desde el sitio web
        </h2>

        <!-- Datos -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px;">
              <strong>Nombre:</strong><br>
              ${nombre}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px;">
              <strong>Email:</strong><br>
              <a href="mailto:${email}" style="color:#CBA135; text-decoration:none;">
                ${email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0 12px; font-size: 14px;">
              <strong>Teléfono:</strong><br>
              ${telefono}
            </td>
          </tr>
        </table>

        <!-- Mensaje -->
        <div style="
          margin-top: 24px;
          padding: 18px;
          background-color: #f4f4f4;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.6;
        ">
          <strong style="color:#000;">Mensaje:</strong>
          <p style="margin: 10px 0 0; white-space: pre-line;">
            ${mensaje}
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="
        background-color: #f0f0f0;
        padding: 16px;
        text-align: center;
        font-size: 11px;
        color: #666;
      ">
        Este mensaje fue enviado desde el formulario de contacto de
        <strong>Aurum Metals</strong>.
      </div>

    </div>
  </div>
`
,
    });

    // Confirmación al usuario
    await transporter.sendMail({
      from: `KenerDev <${import.meta.env.SMTP_USER}>`,
      to: email as string,
      subject: "Hemos recibido tu mensaje",
      html: `
        <p>Hola ${nombre},</p>
        <p>Gracias por escribirnos. Hemos recibido tu mensaje y te responderemos pronto.</p>
        <p><strong>KenerDev</strong></p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error("ERROR SMTP:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Ocurrió un error al enviar el mensaje",
        error: String(error),
      }),
      { status: 500 }
    );
  }
};
