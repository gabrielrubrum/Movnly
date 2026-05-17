import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter | null = null;
    private resend: Resend | null = null;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const resendKey = this.configService.get<string>('RESEND_API_KEY');
        const mailHost = this.configService.get<string>('MAIL_HOST');
        const mailUser = this.configService.get<string>('MAIL_USER');
        const mailPass = this.configService.get<string>('MAIL_PASS');

        if (resendKey && !resendKey.startsWith('re_placeholder')) {
            this.resend = new Resend(resendKey);
            this.logger.log(`Resend service initialized with key: ${resendKey.substring(0, 7)}...`);
        } else if (mailHost && mailUser && mailPass && mailUser !== 'mock-user') {
            this.transporter = nodemailer.createTransport({
                host: mailHost,
                port: Number(this.configService.get('MAIL_PORT')) || 587,
                auth: { user: mailUser, pass: mailPass },
            });
            this.logger.log(`Nodemailer SMTP service initialized with host: ${mailHost}`);
        } else {
            this.logger.warn('No mail provider configured — running in DEV/LOG-ONLY mode.');
        }
        this.logger.log(`MAIL_FROM: ${this.configService.get('MAIL_FROM') || 'NOT SET'}`);
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
            .btn { display: inline-block; background-color: #D4AF37; color: #000000 !important; padding: 18px 45px; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; border-radius: 4px; margin-top: 30px; }
            .text-muted { color: #52525B; font-size: 12px; line-height: 1.6; margin-top: 40px; }
            .accent { color: #D4AF37; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <table class="main" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="header">
                  <img src="https://movnly.com/logoMov.png" alt="MOVNLY" width="140" style="display: block; margin: 0 auto; border: 0;" />
                </td>
              </tr>
              <tr>
                <td class="content">
                  ${content}
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #52525B; text-transform: uppercase; margin: 0;">MOVNLY · Mobilidade de Prestígio</p>
                  <p style="font-size: 9px; color: #3F3F46; margin-top: 10px;">Lisboa, Portugal</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
        `;
    }

    async sendMail(toAddress: string, subject: string, html: string) {
        const to = toAddress.trim().toLowerCase();
        let from = this.configService.get<string>('MAIL_FROM') || 'info@movnly.com';
        // Limpeza de aspas se houver
        from = from.replace(/"/g, '');
        
        try {
            this.logger.log(`Attempting to send email: "${subject}" to ${to} from ${from}`);
            if (this.resend) {
                const { data, error } = await this.resend.emails.send({
                    from: from.includes('<') ? from : `MOVNLY <${from}>`,
                    to, subject, html,
                });
                if (error) {
                    this.logger.error(`Resend error: ${JSON.stringify(error)}`);
                    throw error;
                }
                this.logger.log(`Email sent successfully via Resend: ${data?.id}`);
                return data;
            } else if (this.transporter) {
                const info = await this.transporter.sendMail({ from, to, subject, html });
                this.logger.log(`Email sent successfully via SMTP: ${info.messageId}`);
                return info;
            } else {
                this.logger.warn(`[MAIL-DEV] No provider. Subject: "${subject}" to ${to}`);
            }
        } catch (error) {
            this.logger.error(`Failed to send email: ${(error as any)?.message || error}`);
        }
    }

    async sendVerificationEmail(to: string, token: string) {
        const url = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/verify?token=${token}`;
        const content = `
          <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 20px; color: #ffffff;">Bem-vindo à MOVNLY.</h2>
          <p style="font-size: 16px; font-weight: 400; line-height: 1.6; color: #A1A1AA; margin-bottom: 30px;">Estamos muito felizes por ter você connosco. Para começar a desfrutar da melhor experiência de mobilidade executiva, por favor confirme o seu e-mail abaixo.</p>
          <a href="${url}" class="btn" style="color: #000000 !important;">Confirmar E-mail</a>
          <p class="text-muted" style="text-transform: none; letter-spacing: 0;">Se você não criou esta conta, pode ignorar este e-mail com segurança.</p>
        `;
        return this.sendMail(to, 'Bem-vindo à MOVNLY - Confirme o seu e-mail', this.getLuxuryTemplate(content));
    }

    async sendPasswordResetEmail(to: string, code: string) {
        const content = `
          <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 20px; color: #ffffff;">Recuperação de Senha.</h2>
          <p style="font-size: 16px; font-weight: 400; line-height: 1.6; color: #A1A1AA; margin-bottom: 30px;">Recebemos um pedido para redefinir a sua senha. Utilize o código de verificação abaixo para prosseguir:</p>
          <div style="background: #0A0A0F; padding: 30px; text-align: center; border: 1px solid #D4AF37; margin: 30px 0;">
            <span style="font-size: 40px; font-weight: 800; letter-spacing: 15px; color: #D4AF37; margin-left: 15px;">${code}</span>
          </div>
          <p class="text-muted" style="text-transform: none; letter-spacing: 0;">Este código é válido por 60 minutos. Se não solicitou esta alteração, proteja a sua conta e ignore este e-mail.</p>
        `;
        return this.sendMail(to, 'MOVNLY - Código de Recuperação', this.getLuxuryTemplate(content));
    }

    async sendAssignmentEmail(to: string, role: 'DRIVER' | 'PASSENGER', details: any) {
        const title = role === 'DRIVER' ? 'Nova Missão' : 'Reserva';
        const accent = role === 'DRIVER' ? 'Atribuída' : 'Confirmada';
        const subtitle = role === 'DRIVER' ? 'Detalhes da Viagem' : 'O seu Chauffeur está a caminho';
        const subjectLabel = role === 'DRIVER' ? 'Nova Missão Atribuída' : 'Reserva Confirmada';

        const content = `
          <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #ffffff;">${title} <span class="accent">${accent}</span>.</h2>
          <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #D4AF37; letter-spacing: 2px; margin-bottom: 30px;">${subtitle}</p>
          
          <div style="background: #0A0A0F; padding: 30px; border: 1px solid #1A1A1A; margin-bottom: 30px;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B;">Referência</span><br/>
                  <span style="font-size: 16px; color: #ffffff; font-weight: 600;">#${details.reference}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B;">Origem</span><br/>
                  <span style="font-size: 14px; color: #ffffff;">${details.origin}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #1A1A1A;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B;">Destino</span><br/>
                  <span style="font-size: 14px; color: #ffffff;">${details.destination}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; ${role === 'PASSENGER' ? 'border-bottom: 1px solid #1A1A1A;' : ''}">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B;">Horário</span><br/>
                  <span style="font-size: 14px; color: #D4AF37; font-weight: 600;">${details.time}</span>
                </td>
              </tr>
              ${role === 'PASSENGER' ? `
              <tr>
                <td style="padding: 10px 0;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B;">PIN de Segurança</span><br/>
                  <span style="font-size: 24px; color: #ffffff; font-weight: 800; letter-spacing: 5px;">${details.pin || '---'}</span>
                </td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="font-size: 14px; font-weight: 400; color: #A1A1AA;">
            ${role === 'PASSENGER' ? 'Apresente o PIN acima ao seu Chauffeur para validar o início da viagem.' : 'Aceda ao seu painel para mais detalhes sobre a missão.'}
          </p>
        `;
        return this.sendMail(to, `${subjectLabel} — MOVNLY`, this.getLuxuryTemplate(content));
    }

    async sendReceiptEmail(to: string, booking: any, transaction: any) {
        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">Recibo de <span class="accent">Serviço</span>.</h2>
          <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">Confirmação de Pagamento</p>
          
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

          <p style="font-size: 12px; font-weight: 300; line-height: 1.6; color: rgba(255,255,255,0.4); margin-bottom: 20px;">Este documento serve como comprovativo de pagamento para o serviço de transfer privado MOVNLY.</p>
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <span style="font-size: 9px; font-weight: 800; color: #222; text-transform: uppercase;">MOVNLY | NIF: 500 000 000</span>
          </div>
        `;
        return this.sendMail(to, 'Comprovativo de Pagamento — MOVNLY', this.getLuxuryTemplate(content));
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
          
          <p style="font-size: 12px; color: rgba(255,255,255,0.3);">Continue com a excelência. O seu desempenho é o que define o padrão MOVNLY.</p>
        `;
        return this.sendMail(to, 'Crédito Agendado — MOVNLY Driver Panel', this.getLuxuryTemplate(content));
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
        return this.sendMail(to, 'Liquidação de Fundos — MOVNLY Driver Panel', this.getLuxuryTemplate(content));
    }

    async sendArrivalEmail(to: string, driverName: string, reference: string) {
        const content = `
          <h2 style="font-size: 36px; font-weight: 200; italic; margin-bottom: 10px; line-height: 1;">Chauffeur <span class="accent">Chegou</span>.</h2>
          <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #52525B; letter-spacing: 3px; margin-bottom: 40px;">O seu transporte está no ponto de encontro</p>
          
          <div style="background: #0A0A0F; padding: 40px; border: 1px solid #D4AF37; margin-bottom: 40px;">
            <p style="font-size: 16px; font-weight: 300; color: #ffffff; margin: 0;">O seu Chauffeur <span style="font-weight: 800; color: #D4AF37;">${driverName}</span> acabou de chegar ao ponto de partida designado.</p>
            <p style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 20px;">Por favor, dirija-se ao veículo. Tenha o seu PIN de segurança pronto para validar a viagem.</p>
          </div>
          
          <p style="font-size: 12px; color: rgba(255,255,255,0.3);">Referência da Reserva: #${reference}</p>
        `;
        return this.sendMail(to, 'O seu Chauffeur Chegou — MOVNLY', this.getLuxuryTemplate(content));
    }
}
