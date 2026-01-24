import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    // 1️⃣ DATOS DEL RECLAMANTE
    const tipoDocumento = data.get("tipoDocumento");
    const numeroDocumento = data.get("numeroDocumento");
    const nombres = data.get("nombres");
    const domicilio = data.get("domicilio");
    const departamento = data.get("departamento");
    const provincia = data.get("provincia");
    const distrito = data.get("distrito");
    const telefono = data.get("telefono");
    const email = data.get("email");
    const menor = data.get("menor") ? "Sí" : "No";

    // 2️⃣ SERVICIO
    const descripcion = data.get("descripcion");
    const monto = data.get("monto");

    // 3️⃣ RECLAMO
    const tipo = data.get("tipo"); // Reclamo o Queja
    const detalle = data.get("detalle");
    const pedido = data.get("pedido");

    // 4️⃣ VALIDACIÓN MÍNIMA
    if (!tipoDocumento || !numeroDocumento || !nombres || !email || !tipo || !detalle) {
      return new Response(
        JSON.stringify({ success: false, message: "Campos obligatorios incompletos" }),
        { status: 400 }
      );
    }

    // 5️⃣ TRANSPORTER (IGUAL QUE CONTACTO)
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT),
      secure: true,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    // 6️⃣ CORREO INTERNO (EMPRESA)
    await transporter.sendMail({
      from: `Libro de Reclamaciones Web <${import.meta.env.SMTP_USER}>`,
      to: "contacto@kenerdev.com",
      replyTo: email as string,
      subject: `📄 ${tipo} recibido - ${nombres}`,
      html: `
<div style="font-family:'Montserrat',Arial,sans-serif;background:#0b0b0b;padding:32px 16px;">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden">

    <div style="background:#000;padding:24px;text-align:center">
      <h1 style="margin:0;color:#CBA135;font-size:20px;text-transform:uppercase">
        Aurum Metals
      </h1>
      <p style="color:#d1d1d1;font-size:12px;margin-top:6px">
        Libro de Reclamaciones
      </p>
    </div>

    <div style="padding:28px 24px;color:#1a1a1a">
      <h2 style="border-left:4px solid #CBA135;padding-left:12px">
        Nuevo ${tipo}
      </h2>

      <p><strong>Nombre:</strong> ${nombres}</p>
      <p><strong>Documento:</strong> ${tipoDocumento} ${numeroDocumento}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${telefono || "No indicado"}</p>
      <p><strong>Menor de edad:</strong> ${menor}</p>
      <p><strong>Dirección:</strong> ${domicilio || "-"}</p>
      <p><strong>Ubicación:</strong> ${departamento || ""} ${provincia || ""} ${distrito || ""}</p>

      <hr>

      <p><strong>Servicio:</strong> ${descripcion || "-"}</p>
      <p><strong>Monto:</strong> S/. ${monto || "-"}</p>

      <hr>

      <p><strong>Detalle:</strong></p>
      <p style="background:#f4f4f4;padding:16px;border-radius:8px">
        ${detalle}
      </p>

      <p><strong>Pedido:</strong></p>
      <p style="background:#f4f4f4;padding:16px;border-radius:8px">
        ${pedido || "-"}
      </p>
    </div>

    <div style="background:#f0f0f0;padding:16px;text-align:center;font-size:11px">
      Libro de Reclamaciones – Aurum Metals
    </div>

  </div>
</div>
      `,
    });

    // 7️⃣ CONFIRMACIÓN AL USUARIO
    await transporter.sendMail({
      from: `Aurum Metals <${import.meta.env.SMTP_USER}>`,
      to: email as string,
      subject: "Hemos recibido tu reclamo",
      html: `
        <p>Hola ${nombres},</p>
        <p>Hemos recibido tu <strong>${tipo.toLowerCase()}</strong> correctamente.</p>
        <p>Nuestro equipo lo evaluará y se pondrá en contacto contigo dentro del plazo establecido.</p>
        <p><strong>Aurum Metals</strong></p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("ERROR RECLAMOS:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Ocurrió un error al enviar el reclamo",
        error: String(error),
      }),
      { status: 500 }
    );
  }
};
