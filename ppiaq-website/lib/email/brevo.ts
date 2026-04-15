interface EmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
}

export async function sendEmail(params: EmailParams): Promise<unknown> {
  const apiKey = process.env.BREVO_API_KEY;
  console.log('🔑 BREVO_API_KEY exists:', !!apiKey, '| length:', apiKey?.length ?? 0);
  try {
    if (!apiKey) {
      console.warn('⚠️ Brevo API key not configured. Email not sent.');
      return { message: 'Email service not configured (development mode)' };
    }

    const emailData = {
      sender: params.sender || {
        email: 'qld@ppi-australia.org',
        name: "Indonesian Students' Association of Australia Queensland",
      },
      to: params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
      replyTo: {
        email: 'qld@ppi-australia.org',
        name: "Indonesian Students' Association of Australia Queensland",
      },
    };

    // Use fetch API to call Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully:', data);
      return data;
    } else {
      console.error('❌ Brevo API error - Status:', response.status);
      console.error('❌ Brevo API error - Response:', JSON.stringify(data, null, 2));
      console.error('❌ Sender email used:', emailData.sender.email);
      throw new Error(`Brevo API error ${response.status}: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Email template functions
export function getMembershipApplicationTemplate(
  firstName: string,
  lastName: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): string {
  if (status === 'approved') {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #28A745; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Aplikasi Membership Disetujui</h1>
            </div>
            <div style="padding: 20px;">
              <p>Halo ${firstName} ${lastName},</p>
              <p>Kami dengan senang hati menjadi tahu bahwa aplikasi membership Anda telah <strong>DISETUJUI</strong>! 🎉</p>
              <p>Anda sekarang merupakan bagian resmi dari PPIAQ (Perhimpunan Pelajar Indonesia di Australia). Selamat bergabung!</p>
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Salam hangat,<br>
                <strong>Tim PPIAQ</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  if (status === 'rejected') {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #DC3545; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Keputusan Aplikasi Membership</h1>
            </div>
            <div style="padding: 20px;">
              <p>Halo ${firstName} ${lastName},</p>
              <p>Terima kasih telah mengajukan aplikasi membership untuk bergabung dengan PPIAQ.</p>
              <p>Sayangnya, aplikasi Anda saat ini <strong>DITOLAK</strong> dengan alasan sebagai berikut:</p>
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0; color: #721c24;">
                <p style="margin: 0;"><strong>Alasan Penolakan:</strong> ${rejectionReason || 'Tidak tersedia'}</p>
              </div>
              <p>Jika Anda memiliki pertanyaan atau ingin mendiskusikan keputusan ini, silakan hubungi kami di qld@ppi-australia.org</p>
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Salam hormat,<br>
                <strong>Tim PPIAQ</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // pending
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #FFA500; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Aplikasi Membership Diterima</h1>
          </div>
          <div style="padding: 20px;">
            <p>Halo ${firstName} ${lastName},</p>
            <p>Terima kasih telah mengajukan aplikasi membership untuk PPIAQ!</p>
            <p>Kami telah menerima aplikasi Anda dan saat ini sedang dalam proses review oleh tim kami. Status aplikasi Anda adalah <strong style="color: #FFA500;">DITUNDA</strong>.</p>
            <p>Anda akan diberitahu segera setelah keputusan dibuat. Biasanya ini memakan waktu 3-5 hari kerja.</p>
            <p>Terima kasih atas kesabaran Anda!</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Salam hangat,<br>
              <strong>Tim PPIAQ</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getNewsletterSubscriptionTemplate(email: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007BFF; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Berhasil Berlangganan Newsletter</h1>
          </div>
          <div style="padding: 20px;">
            <p>Halo,</p>
            <p>Selamat! Anda berhasil berlangganan newsletter PPIAQ. ✉️</p>
            <p>Mulai sekarang, Anda akan menerima update terbaru tentang acara, berita, dan informasi penting dari PPIAQ langsung ke email Anda.</p>
            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; margin: 20px 0;">
              <strong>Email yang terdaftar:</strong> ${email}
            </p>
            <p>Jika Anda ingin berhenti berlangganan, Anda dapat melakukannya kapan saja dengan mengklik link di bagian bawah setiap email yang kami kirimkan.</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Terima kasih telah menjadi bagian dari komunitas PPIAQ!<br>
              <strong>Tim PPIAQ</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getUnrejectTemplate(firstName: string, lastName: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #FFA500; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Aplikasi Membership Akan Dievaluasi Ulang</h1>
          </div>
          <div style="padding: 20px;">
            <p>Halo ${firstName} ${lastName},</p>
            <p>Kami ingin memberitahukan bahwa aplikasi membership Anda yang sebelumnya <strong>DITOLAK</strong> akan kami <strong>EVALUASI ULANG</strong>.</p>
            <p style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; color: #856404;">
              ⚠️ Status aplikasi Anda sekarang: <strong>DITUNDA (Pending)</strong>
            </p>
            <p>Tim kami akan meninjau kembali aplikasi Anda dengan seksama. Anda akan menerima notifikasi segera setelah keputusan dibuat, biasanya dalam 3-5 hari kerja.</p>
            <p>Terima kasih atas kesempatan kedua ini. Kami tunggu bukti terbaik dari Anda!</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Salam hangat,<br>
              <strong>Tim PPIAQ</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetTemplate(
  firstName: string,
  resetUrl: string,
  expiresInMinutes: number
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #B64847; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Reset Password Akun PPIAQ</h1>
          </div>
          <div style="padding: 20px;">
            <p>Halo ${firstName},</p>
            <p>Kami menerima permintaan untuk reset password akun Anda.</p>
            <p>Silakan klik tombol di bawah untuk membuat password baru:</p>
            <p style="text-align: center; margin: 28px 0;">
              <a
                href="${resetUrl}"
                style="display: inline-block; background-color: #B64847; color: #fff; text-decoration: none; font-weight: bold; padding: 12px 22px; border-radius: 8px;"
              >
                Reset Password
              </a>
            </p>
            <p>Link ini berlaku selama <strong>${expiresInMinutes} menit</strong>.</p>
            <p>Jika tombol tidak berfungsi, gunakan link ini:</p>
            <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Salam hangat,<br>
              <strong>Tim PPIAQ</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
