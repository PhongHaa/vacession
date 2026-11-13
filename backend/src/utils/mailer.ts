/**
 * Gửi email. Hiện tại chỉ in ra console để dev.
 * Khi deploy: cài nodemailer (hoặc Resend, SendGrid...) và thay phần thân hàm này.
 */
export async function sendMail(to: string, subject: string, text: string) {
  console.log(`\n📧 [MAIL] To: ${to}\nSubject: ${subject}\n${text}\n`);
}
