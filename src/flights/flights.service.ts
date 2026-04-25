import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FlightData {
    id: string;
    airline: string;
    from: string;
    terminal: string;
    status: 'ON_TIME' | 'DELAYED' | 'LANDED' | 'APPROACHING';
    sta: string;
    eta: string;
    gate: string;
    belt: string;
    hasBooking: boolean;
    bookingId?: string;
}

@Injectable()
export class FlightsService {
    constructor(private prisma: PrismaService) { }

    async getLisArrivals(): Promise<FlightData[]> {
        // High-fidelity simulation of LIS arrivals
        // In a production environment with an API Key, this would call AviationStack/OpenSky
        const LIS_DATA: FlightData[] = [
            { id: 'TP1350', airline: 'TAP Air Portugal', from: 'London (LHR)', terminal: 'T1', status: 'ON_TIME', sta: '14:30', eta: '14:30', gate: '42', belt: '8', hasBooking: false },
            { id: 'EK191', airline: 'Emirates', from: 'Dubai (DXB)', terminal: 'T1', status: 'APPROACHING', sta: '15:10', eta: '15:05', gate: '21', belt: '4', hasBooking: false },
            { id: 'AF1124', airline: 'Air France', from: 'Paris (CDG)', terminal: 'T1', status: 'DELAYED', sta: '15:45', eta: '16:20', gate: '12', belt: '2', hasBooking: false },
            { id: 'TP214', airline: 'TAP Air Portugal', from: 'New York (JFK)', terminal: 'T1', status: 'LANDED', sta: '13:50', eta: '13:45', gate: '44', belt: '1', hasBooking: false },
            { id: 'LH1167', airline: 'Lufthansa', from: 'Frankfurt (FRA)', terminal: 'T1', status: 'ON_TIME', sta: '16:00', eta: '16:00', gate: '08', belt: '5', hasBooking: false },
            { id: 'BA502', airline: 'British Airways', from: 'London (LHR)', terminal: 'T1', status: 'APPROACHING', sta: '16:30', eta: '16:35', gate: '15', belt: '9', hasBooking: false },
        ];

        // Cross-reference with real bookings
        const activeBookings = await this.prisma.booking.findMany({
            where: {
                flightNumber: { not: null },
                status: 'CONFIRMED'
            },
            select: {
                id: true,
                flightNumber: true
            }
        });

        return LIS_DATA.map(flight => {
            const booking = activeBookings.find(b => b.flightNumber?.toUpperCase() === flight.id.toUpperCase());
            if (booking) {
                return { ...flight, hasBooking: true, bookingId: booking.id };
            }
            return flight;
        });
    }
}
