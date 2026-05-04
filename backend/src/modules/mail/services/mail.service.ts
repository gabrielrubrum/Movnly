import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter | null = null;
    private resend: Resend | null = null;

    constructor() {
        const resendKey = process.env.RESEND_API_KEY;
        const mailHost = process.env.MAIL_HOST;
        const mailUser = process.env.MAIL_USER;
        const mailPass = process.env.MAIL_PASS;

        if (resendKey && !resendKey.startsWith('re_placeholder')) {
            this.resend = new Resend(resendKey);
            console.log('[MAIL] Resend service initialized.');
        } else if (mailHost && mailUser && mailPass && mailUser !== 'mock-user') {
            this.transporter = nodemailer.createTransport({
                host: mailHost,
                port: Number(process.env.MAIL_PORT) || 587,
                auth: { user: mailUser, pass: mailPass },
            });
            console.log('[MAIL] Nodemailer SMTP service initialized.');
        } else {
            console.log('[MAIL] No mail provider configured — running in DEV/LOG-ONLY mode.');
        }
    }

    private getLuxuryTemplate(content: string, title?: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;800&display=swap');
            body { margin: 0; padding: 0; background-color: #030303; font-family: 'Plus Jakarta Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #030303; padding-bottom: 60px; }
            .main { background-color: #07070A; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #ffffff; border: 1px solid #1A1A1A; }
            .header { background: linear-gradient(180deg, #0A0A0F 0%, #07070A 100%); padding: 60px 40px; text-align: center; border-bottom: 1px solid #1A1A1A; }
            .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; color: #ffffff; font-style: italic; }
            .logo span { color: #D4AF37; font-style: normal; }
            .content { padding: 60px 50px; }
            .footer { padding: 40px; text-align: center; background-color: #030303; border-top: 1px solid #1A1A1A; }
            .btn { display: inline-block; background-color: #D4AF37; color: #000000; padding: 18px 45px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; border-radius: 4px; margin-top: 30px; transition: all 0.3s; }
            .text-muted { color: #52525B; font-size: 12px; line-height: 1.8; margin-top: 40px; }
            .accent { color: #D4AF37; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <table class="main">
              <tr>
                <td class="header">
                  <div class="logo">Nex<span>Rice</span></div>
                  <div style="font-size: 8px; font-weight: 800; color: #D4AF37; letter-spacing: 6px; margin-top: 15px; text-transform: uppercase; opacity: 0.6;">Luxury Mobility Network</div>
                </td>
              </tr>
              <tr>
                <td class="content">
                  ${content}
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="font-size: 9px; font-weight: 800; letter-spacing: 5px; color: #222; text-transform: uppercase; margin: 0;">Quiet Luxury · Global Excellence</p>
                  <p style="font-size: 8px; color: #111; margin-top: 10px;">NexRice Corporate HQ • Lisbon, Portugal</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
        `;
    }

    async sendMail(to: string, subject: string, html: string) {
        const from = process.env.MAIL_FROM || '"NexRice Elite" <info@nexrice.com>';
        try {
            if (this.resend) {
                const { data, error } = await this.resend.emails.send({
                    from: from.includes('<') ? from : `NexRice Elite <${from}>`,
                    to, subject, html,
                });
                if (error) throw error;
                return data;
            } else if (this.transporter) {
                return await this.transporter.sendMail({ from, to, subject, html });
            } else {
                // DEV mode: log only, no SMTP attempt
                console.log(`[MAIL-DEV] Would send "${subject}" to ${to}`);
            }
        } catch (error) {
            console.error('[MAIL] Failed to send email:', (error as any)?.message || error);
            console.log(`[MAIL-DEV] Would send "${subject}" to ${to}`);
        }
    }

    async sendVerificationEmail(to: string, token: string) {
        const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
        const content = `
          <h2 style="font-size: 42px; font-weight: 200; italic; margin-bottom: 30px; line-height: 1;">Bem-vindo à <span class="accent">Elite</span>.</h2>
          <p style="font-size: 18px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.4); margin-bottom: 40px;">Sua entrada na rede operacional da NexRice foi iniciada. Valide sua credencial para ativar o acesso total.</p>
          <a href="${url}" class="btn">Validar Identidade</a>
          <p class="text-muted">Se você não iniciou este protocolo, ignore este comunicado. Auditoria de segurança monitorada.</p>
        `;
        return this.sendMail(to, 'Acesso Institucional — NexRice Elite', this.getLuxuryTemplate(content));
    }

    async sendPasswordResetEmail(to: string, code: string) {
        const content = `
          <h2 style="font-size: 42px; font-weight: 200; italic; margin-bottom: 30px; line-height: 1;">Protocolo de <span class="accent">Segurança</span>.</h2>
          <p style="font-size: 18px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.4); margin-bottom: 40px;">Uma recuperação de senha foi solicitada para o seu perfil corporativo. Utilize o código de alta precisão abaixo:</p>
          <div style="background: #000; padding: 40px; text-align: center; border: 1px solid #D4AF37; margin: 40px 0;">
            <span style="font-size: 48px; font-weight: 800; letter-spacing: 20px; color: #D4AF37; margin-left: 20px;">${code}</span>
          </div>
          <p class="text-muted">Este código expira em 60 minutos por razões de segurança. Protocolo 2.6 Secured.</p>
        `;
        return this.sendMail(to, 'Código de Recuperação — NexRice Elite', this.getLuxuryTemplate(content));
    }

    async sendAssignmentEmail(to: string, role: 'DRIVER' | 'PASSENGER', details: any) {
        const title = role === 'DRIVER' ? 'Nova Missão' : 'Reserva';
        const accent = role === 'DRIVER' ? 'Confirmada' : 'Confirmada';
        const subtitle = role === 'DRIVER' ? 'Missão de Transporte de Elite' : 'O seu Chauffeur está a caminho';
        const subjectLabel = role === 'DRIVER' ? 'Nova Missão Confirmada' : 'Reserva Confirmada';

        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">${title} <span class="accent">${accent}</span>.</h2>
          <p style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">${subtitle}</p>
          
          <div style="background: #0A0A0F; padding: 30px; border-left: 2px solid #D4AF37; margin-bottom: 40px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #52525B;">Referência</span><br/>
                  <span style="font-size: 16px; color: #ffffff; font-weight: 400;">${details.reference}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #52525B;">De</span><br/>
                  <span style="font-size: 15px; color: #ffffff; font-weight: 200;">${details.origin}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #52525B;">Para</span><br/>
                  <span style="font-size: 15px; color: #ffffff; font-weight: 200;">${details.destination}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #52525B;">Horário</span><br/>
                  <span style="font-size: 15px; color: #D4AF37; font-weight: 400;">${details.time}</span>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; font-weight: 300; italic; color: rgba(255,255,255,0.3);">NexRice Elite: A excelência é o nosso padrão mínimo de operação.</p>
        `;
        return this.sendMail(to, `${subjectLabel} — NexRice Elite`, this.getLuxuryTemplate(content));
    }

    async sendReceiptEmail(to: string, booking: any, transaction: any) {
        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">Recibo de <span class="accent">Serviço</span>.</h2>
          <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">Confirmação de Pagamento de Elite</p>
          
          <div style="background: #000; padding: 40px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 40px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding-bottom: 30px;">
                  <span style="font-size: 24px; font-weight: 800; color: #ffffff;">${transaction.amount}€</span><br/>
                  <span style="font-size: 9px; uppercase; color: #D4AF37; letter-spacing: 2px;">Valor Liquidado via Stripe</span>
                </td>
              </tr>
              <tr>
                <td style="border-top: 1px solid rgba(255,255,255,0.05); padding: 20px 0;">
                  <table width="100%">
                    <tr>
                      <td style="font-size: 11px; color: #52525B;">Referência da Reserva</td>
                      <td style="font-size: 11px; color: #ffffff; text-align: right; font-weight: 800;">#${booking.reference}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #52525B; padding-top: 10px;">ID da Transação</td>
                      <td style="font-size: 11px; color: #ffffff; text-align: right; font-weight: 200; padding-top: 10px;">${transaction.id}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px; color: #52525B; padding-top: 10px;">Data de Operação</td>
                      <td style="font-size: 11px; color: #ffffff; text-align: right; font-weight: 200; padding-top: 10px;">${new Date().toLocaleDateString('pt-PT')}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.4); margin-bottom: 20px;">Este documento serve como comprovativo de pagamento para o serviço de transfer privado NexRice.</p>
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <span style="font-size: 9px; font-weight: 800; color: #222; text-transform: uppercase;">NexRice Elite Technology S.A. | NIF: 500 000 000</span>
          </div>
        `;
        return this.sendMail(to, 'Comprovativo de Pagamento — NexRice Elite', this.getLuxuryTemplate(content));
    }

    async sendPayoutScheduledEmail(to: string, amount: number) {
        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">Crédito <span class="accent">Agendado</span>.</h2>
          <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">Atualização do seu Saldo Operacional</p>
          
          <div style="background: #0A0A0F; padding: 40px; border-left: 2px solid #D4AF37; margin-bottom: 40px;">
            <p style="font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.6); margin: 0;">Parabéns pela conclusão da missão.</p>
            <p style="font-size: 28px; font-weight: 800; color: #ffffff; margin-top: 20px;">${amount}€</p>
            <p style="font-size: 11px; color: #D4AF37; margin-top: 5px;">Movido para Saldo em Retenção (Libertação em 20 dias)</p>
          </div>
          
          <p style="font-size: 12px; color: rgba(255,255,255,0.3);">Continue com a excelência. O seu desempenho é o que define o padrão NexRice.</p>
        `;
        return this.sendMail(to, 'Crédito Agendado — NexRice Driver Panel', this.getLuxuryTemplate(content));
    }

    async sendWithdrawalConfirmationEmail(to: string, amount: number) {
        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">Levantamento <span class="accent">Concluído</span>.</h2>
          <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">Transferência Bancária via Stripe Connect</p>
          
          <div style="background: #000; padding: 40px; border: 1px solid #D4AF37; text-align: center; margin-bottom: 40px;">
            <span style="font-size: 32px; font-weight: 800; color: #ffffff;">${amount}€</span><br/>
            <span style="font-size: 9px; uppercase; color: #D4AF37; letter-spacing: 2px; margin-top: 10px; display: block;">Liquidado na sua conta bancária</span>
          </div>

          <p style="font-size: 12px; color: rgba(255,255,255,0.3);">A transferência pode demorar entre 1 a 3 dias úteis a surgir no seu extrato bancário, dependendo do seu banco comercial.</p>
        `;
        return this.sendMail(to, 'Liquidação de Fundos — NexRice Driver Panel', this.getLuxuryTemplate(content));
    }
}
