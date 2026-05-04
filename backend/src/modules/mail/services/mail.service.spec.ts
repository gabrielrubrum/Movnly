import { MailService } from './mail.service';

describe('MailService (NexRice Elite)', () => {
    let mailService: MailService;
    
    beforeEach(() => {
        // Mock environment variables
        process.env.RESEND_API_KEY = 're_test_key';
        process.env.MAIL_FROM = 'info@test.NexRice.pt';
        
        mailService = new MailService();
        
        // Mock the sendMail method to avoid actual network calls
        (mailService as any).sendMail = jest.fn().mockResolvedValue({ id: 'mock-id' });
    });

    it('should generate a valid luxury receipt template', async () => {
        const mockBooking = { reference: 'TEST-123' };
        const mockTransaction = { id: 'TX-456', amount: 45.50 };
        
        await mailService.sendReceiptEmail('vip@guest.com', mockBooking, mockTransaction);
        
        expect((mailService as any).sendMail).toHaveBeenCalledWith(
            'vip@guest.com',
            expect.stringContaining('Comprovativo de Pagamento'),
            expect.stringContaining('TEST-123')
        );
        
        // Verify luxury aesthetic markers are present in HTML
        const html = (mailService as any).sendMail.mock.calls[0][2];
        expect(html).toContain('D4AF37'); // Gold hex
        expect(html).toContain('Plus Jakarta Sans'); // Font
        expect(html).toContain('NexRice Elite'); // Branding
    });

    it('should generate a valid payout scheduled email for drivers', async () => {
        await mailService.sendPayoutScheduledEmail('driver@NexRice.pt', 25.00);
        
        expect((mailService as any).sendMail).toHaveBeenCalledWith(
            'driver@NexRice.pt',
            expect.stringContaining('Crédito Agendado'),
            expect.stringContaining('25€')
        );
    });

    it('should generate a valid withdrawal confirmation email', async () => {
        await mailService.sendWithdrawalConfirmationEmail('driver@NexRice.pt', 150.00);
        
        expect((mailService as any).sendMail).toHaveBeenCalledWith(
            'driver@NexRice.pt',
            expect.stringContaining('Liquidação de Fundos'),
            expect.stringContaining('150€')
        );
    });
});
