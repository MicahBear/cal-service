//helpers to manipulate the booking model:

import type { Booking, User } from '@prisma/client';
import { getEnhancedPrisma } from '~/db.server';
export type { Booking } from '@prisma/client';

// gets a booking with its owner and invited users

export function getBooking({
    id,
    userId,
}: Pick<Booking, 'id'> & {
    userId: User['id'];
}) {
    return getEnhancedPrisma(userId).booking.findFirst({
        where: { id },
        include: { user: true, invitedUsers: { include: { user: true } } },
    });
}

// get all bookings

export function getBookingItems({userId}: {userId: User['id']}){
    return getEnhancedPrisma(userId).booking.findMany({
        orderBy: {updatedAt:'desc'},
    })
}