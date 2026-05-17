const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  console.log('--- TESTE DE EMAIL MOVNLY (RECUPERAÇÃO DE SENHA) ---');
  const targetEmail = 'gabrielflamengof50@gmail.com'; // Testando em minúsculas
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'MOVNLY <contato@movnly.com>',
      to: targetEmail,
      subject: 'Teste: Recuperação de Senha MOVNLY',
      html: `
        <div style="background: #030303; color: white; padding: 40px; font-family: sans-serif;">
          <h2 style="color: #D4AF37;">Teste de Recuperação</h2>
          <p>Se você recebeu este e-mail, o sistema de envio está FUNCIONANDO.</p>
          <div style="background: #111; padding: 20px; border: 1px solid #D4AF37; font-size: 24px; text-align: center;">
            CÓDIGO: 123 456
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ ERRO DO RESEND:', error);
    } else {
      console.log('✅ SUCESSO! E-mail enviado para:', targetEmail);
      console.log('ID:', data.id);
    }
  } catch (err) {
    console.error('💥 ERRO FATAL:', err.message);
  }
}

run();
