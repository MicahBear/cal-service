import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { getBookingItems } from '~/models/booking.server';
import type { User } from '~/models/user.server';
import { requireUserId } from '~/session.server';
import { useUser } from '~/utils';

export async function loader({ request }: LoaderArgs) {
    const userId = await requireUserId(request);
    const bookings = await getBookingItems({ userId });
    return json({ bookings });
}

function getBookingUrl(user: User) {
    const url = new URL(window.location.href);
    url.pathname = `/new`;
    url.search = `?uid=${user.id}`;
    return url.toString();
}

export default function BookingsPage() {
    const data = useLoaderData<typeof loader>();
    const user = useUser();
    const [bookingUrl, setBookingUrl] = useState('');

    useEffect(() => {
        setBookingUrl(getBookingUrl(user));
    }, [user]);

    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
                <h1 className="text-3xl font-bold">
                    <Link to=".">Bookings</Link>
                </h1>
                <p>{user.email}</p>
                <Form action="/logout" method="post">
                    <button
                        type="submit"
                        className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                    >
                        Logout
                    </button>
                </Form>
            </header>

            <main className="flex h-full bg-white">
                <div className="h-full w-1/3 border-r bg-gray-50">
                    <div className="p-8">
                        <h3 className="pb-1 font-semibold">Public url:</h3>
                        <p className="italic">{bookingUrl}</p>
                    </div>

                    <hr />

                    {data.bookings.length === 0 ? (
                        <p className="p-4">No bookings yet</p>
                    ) : (
                        <ol>
                            {data.bookings.map((booking) => (
                                <li key={booking.id}>
                                    <NavLink
                                        className={({ isActive }) =>
                                            `block border-b p-6 text-xl ${isActive ? 'bg-white' : ''}`
                                        }
                                        to={booking.id}
                                    >
                                        <div className="flex items-baseline justify-between">
                                            <span>🗓️ {booking.email}</span>
                                            <span className="ml-8 inline-block text-sm">
                                                {new Date(booking.startAt).toLocaleString()} ~ {booking.duration} min
                                            </span>
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}