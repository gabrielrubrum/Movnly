import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) {}

    async sendToUser(userId: string, payload: PushPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true },
        });
        if (!user?.pushToken) return { sent: false, reason: 'no_token' };
        return this.sendExpoPush(user.pushToken, payload);
    }

    async notifyOnlineDrivers(payload: PushPayload) {
        const drivers = await this.prisma.user.findMany({
            where: {
                role: 'DRIVER',
                pushToken: { not: null },
                driverProfile: { status: 'ONLINE' },
            },
            select: { pushToken: true },
        });

        const tokens = drivers.map((d) => d.pushToken!).filter(Boolean);
        if (tokens.length === 0) return { sent: 0 };

        const results = await Promise.allSettled(
            tokens.map((token) => this.sendExpoPush(token, payload)),
        );
        const sent = results.filter((r) => r.status === 'fulfilled').length;
        this.logger.log(`Push enviado para ${sent}/${tokens.length} motoristas online`);
        return { sent, total: tokens.length };
    }

    private async sendExpoPush(token: string, payload: PushPayload) {
        if (!token.startsWith('ExponentPushToken')) {
            this.logger.debug(`Token não-Expo ignorado: ${token.slice(0, 20)}...`);
            return { sent: false, reason: 'not_expo_token' };
        }

        try {
            const res = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    to: token,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    sound: 'default',
                    priority: 'high',
                }),
            });
            const json = await res.json();
            return { sent: true, response: json };
        } catch (err) {
            this.logger.warn(`Falha ao enviar push: ${err}`);
            return { sent: false, reason: 'fetch_error' };
        }
    }
}
