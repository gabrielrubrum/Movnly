import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger = new Logger('ChatGateway');

    constructor(private prisma: PrismaService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Chat client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Chat client disconnected: ${client.id}`);
    }

    // Client joins a room specific to a booking
    @SubscribeMessage('join_booking_chat')
    handleJoin(@MessageBody() data: { bookingId: string }, @ConnectedSocket() client: Socket) {
        client.join(`booking:${data.bookingId}`);
        this.logger.log(`Client ${client.id} joined chat for booking ${data.bookingId}`);
    }

    // Client sends a message
    @SubscribeMessage('send_message')
    async handleMessage(
        @MessageBody() data: { bookingId: string; senderId: string; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        if (!data.bookingId || !data.senderId || !data.content?.trim()) return;

        // Persist to database
        const message = await (this.prisma as any).chatMessage.create({
            data: {
                bookingId: data.bookingId,
                senderId: data.senderId,
                content: data.content.trim(),
            },
            include: {
                sender: { select: { id: true, name: true, role: true } },
            },
        });

        // Broadcast to all in this booking's room
        this.server.to(`booking:${data.bookingId}`).emit('new_message', message);
    }

    // Load chat history for a booking
    @SubscribeMessage('get_chat_history')
    async handleGetHistory(
        @MessageBody() data: { bookingId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const messages = await (this.prisma as any).chatMessage.findMany({
            where: { bookingId: data.bookingId },
            include: {
                sender: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });

        client.emit('chat_history', messages);
    }
}
