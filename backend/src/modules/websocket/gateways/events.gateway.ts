import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // For development flexibility
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('EventsGateway');

    afterInit(server: Server) {
        this.logger.log('Institutional WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Institutional Broadcast Methods
    emitBookingUpdate(bookingId: string, status: string, data: any) {
        this.server.emit('booking_update', { bookingId, status, ...data });
    }

    emitPaymentStatus(paymentId: string, status: string) {
        this.server.emit('payment_update', { paymentId, status });
    }

    // Notifica TODOS os drivers online que há uma nova corrida disponível
    emitNewRideAvailable(booking: any) {
        this.server.emit('new_ride_available', {
            bookingId: booking.id,
            from: booking.from,
            to: booking.to,
            category: booking.category,
            price: booking.price,
            pickupTime: booking.pickupTime,
            passengers: booking.passengers,
        });
    }

    emitDriverLocation(driverId: string, location: { lat: number; lng: number }) {
        this.server.emit('driver_location', { driverId, ...location });
    }
}
