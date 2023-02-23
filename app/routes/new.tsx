import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import Calendar from 'react-calendar';
import styles from 'react-calendar/dist/Calendar.css';
import { createBooking } from '~/models/booking.server';
import { getUserById } from '~/models/user.server';

export function links() {
    return [{ rel: 'stylesheet', href: styles }];
}

export async function loader({ request }: LoaderArgs) {
    const url = new URL(request.url);
    const uid = url.searchParams.get('uid');
    if (!uid) {
        throw Error('Missing uid parameter');
    }
    const user = await getUserById(uid);
    return json({ user });
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();
    const uid = formData.get('uid');
    const email = formData.get('email');
    const notes = formData.get('notes');
    const startAt = formData.get('startAt') as string;

    if (typeof uid !== 'string' || uid.length === 0) {
        return json({ errors: { email: null, notes: null } }, { status: 400 });
    }

    if (typeof email !== 'string' || email.length === 0) {
        return json({ errors: { email: 'Email is required', notes: null } }, { status: 400 });
    }

    if (typeof notes !== 'string' || notes.length === 0) {
        return json({ errors: { email: null, notes: 'Notes is required' } }, { status: 400 });
    }

    await createBooking({
        email,
        notes,
        userId: uid,
        startAt: new Date(startAt),
        duration: 30,
    });

    return redirect(`/thankyou`);
}

export const meta: MetaFunction = () => {
    return {
        title: 'Create Booking',
    };
};

export default function NewBookingPage() {
    const data = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const emailRef = React.useRef<HTMLInputElement>(null);
    const notesRef = React.useRef<HTMLTextAreaElement>(null);
    const [date, setDate] = React.useState(new Date());
    const [hour, setHour] = React.useState('8');
    const [duration, setDuration] = React.useState(30);
    const [startAt, setStartAt] = React.useState(new Date().toISOString());

    function updateStartAt(date: Date, hour: number) {
        const d = new Date(date);
        d.setHours(hour);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        setStartAt(d.toISOString());
        console.log(d.toISOString());
    }

    function onDateChange(date: Date) {
        setDate(date);
        updateStartAt(date, parseInt(hour));
    }

    function onHourChange(hour: string) {
        console.log(hour);
        setHour(hour);
        updateStartAt(date, parseInt(hour));
    }

    React.useEffect(() => {
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        } else if (actionData?.errors?.notes) {
            notesRef.current?.focus();
        }
    }, [actionData]);

    return (
        <div className="mx-auto max-w-5xl py-16">
            <h1 className="pb-4 text-center text-3xl font-semibold">Create a booking</h1>
            <p className="pb-4 text-center">Booking request will be sent to {data.user?.email}</p>
            <Form
                method="post"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    width: '100%',
                }}
            >
                <div>
                    <label className="flex w-full flex-col gap-1">
                        <span>Email: </span>
                        <input
                            ref={emailRef}
                            name="email"
                            type="email"
                            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                        />
                    </label>
                    {actionData?.errors?.email && (
                        <div className="pt-1 text-red-700" id="email-error">
                            {actionData.errors.email}
                        </div>
                    )}
                </div>
                <div>
                    <label className="flex w-full flex-col gap-1">
                        <span>Notes: </span>
                        <textarea
                            ref={notesRef}
                            name="notes"
                            rows={8}
                            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
                        />
                    </label>
                    {actionData?.errors?.notes && (
                        <div className="pt-1 text-red-700" id="notes-error">
                            {actionData.errors.notes}
                        </div>
                    )}
                </div>
                <div className="flex flex-row gap-4">
                    <div>
                        <label className="flex w-full flex-col gap-1">
                            <span>Date: </span>
                            <Calendar
                                className="rounded-lg border-2 border-blue-500 p-4"
                                value={date}
                                onChange={onDateChange}
                            />
                        </label>
                    </div>
                    <div className="flex flex-grow flex-col gap-2">
                        <label className="flex w-full flex-col gap-1">
                            <span>Start At: </span>
                            <select
                                name="startTime"
                                className="rounded-lg border-2 border-blue-500 p-2"
                                value={hour}
                                onChange={(e) => onHourChange(e.currentTarget.value)}
                            >
                                {[...Array(24).keys()].map((i) => (
                                    <option key={i} value={`${i}`}>
                                        {String(i).padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex w-full flex-col gap-1">
                            <span>Duration: {duration} minutes</span>
                            <input
                                name="duration"
                                type="range"
                                min="15"
                                max="120"
                                step="15"
                                className="rounded-lg border-2 border-blue-500 p-2"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            />
                        </label>
                    </div>
                </div>
                <input type="hidden" value={data.user?.id} name="uid" />
                <input type="hidden" value={startAt} name="startAt" />
                <div className="text-right">
                    <button
                        type="submit"
                        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                    >
                        Send Request
                    </button>
                </div>
            </Form>
        </div>
    );
}