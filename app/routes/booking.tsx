import { json } from '@remix-run/node';
import { LoaderArgs } from "@remix-run/server-runtime";
import { getBookingItems } from "~/models/booking.server";
import type { User } from '~/models/user.server';
import { requireUserId } from "~/session.server";

export async function loader({request}: LoaderArgs){
    const userId = await requireUserId(request);
    const bookings = await getBookingItems({userId});
    return json({bookings});
}

function getBookingUrl(user:User){
    const url = new URL(window.location.href);
    url.pathname = `/new`;
    url.search = `?uid=${user.id}`;
    return url.toString();
}