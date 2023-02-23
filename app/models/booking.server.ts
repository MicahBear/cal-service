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

// get all booking items

export function getBookingItems({userId}: {userId: User['id']}){
    return getEnhancedPrisma(userId).booking.findMany({
        orderBy: {updatedAt:'desc'},
    })
}

export function createBooking({
    userId,
    email,
    notes,
    startAt,
    duration,
}: Pick<Booking,'email' | 'notes'| 'startAt' | 'duration'> & {
    userId: User['id'];
}){
    return getEnhancedPrisma(userId).booking.create({
        data:{
            email,
            notes,
            startAt,
            duration,
            user: {
                connect:{
                    id:userId,
                },
            },
        },
    })
}

// Adds or removes an invitation of a booking
export function updateInvite({
    userId,
    bookingId,
    inviteUserId,
    add,
}: {
    userId: User['id'];
    bookingId: Booking['id'];
    inviteUserId: User['id'];
    add: boolean;
}) {
    return getEnhancedPrisma(userId).booking.update({
        where: { id: bookingId },
        include: { invitedUsers: true },
        data: {
            invitedUsers: add
                ? {
                      connectOrCreate: {
                          where: {
                              bookingId_userId: {
                                  bookingId,
                                  userId: inviteUserId,
                              },
                          },
                          create: {
                              user: {
                                  connect: { id: inviteUserId },
                              },
                          },
                      },
                  }
                : {
                      delete: {
                          bookingId_userId: {
                              bookingId,
                              userId: inviteUserId,
                          },
                      },
                  },
        },
    });
}
// Deletes a booking
export function deleteBooking({ id, userId }: Pick<Booking, 'id'> & { userId: User['id'] }) {
    return getEnhancedPrisma(userId).booking.delete({
        where: { id },
    });
}