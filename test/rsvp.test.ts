import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import UserModel from '../src/models/userModel';
import EventModel from '../src/models/eventModel';
import TicketModel from '../src/models/ticketModel';

// Instead of using require, import the firebase admin config using ES module syntax.
import admin from '../src/config/firebaseConfig';
import { Auth } from 'firebase-admin/auth';

let userId: string;
let eventId: string;

beforeEach(async () => {
    // Clear the database before each test
    await UserModel.deleteMany({});
    await EventModel.deleteMany({});
    await TicketModel.deleteMany({});

    // Create a test user
    const userResponse = await request(app)
        .post('/api/users/create-user')
        .send({ 
            username: 'Test User', 
            email: 'test@example.com',
            uid: '12uid13459',
            admin: false
        });
    
    userId = userResponse.body.user._id;
    console.log(userId);
    expect(userId).toBeTruthy();

    // Create a test event
    const eventResponse = await request(app)
        .post('/api/events/create-event')
        .send({ 
            name: 'Test Event', 
            max_attendees: 3, 
            max_rsvps: 4, 
            start_date: "2025-06-01T12:00:00.000Z", 
            end_date: "2025-06-01T18:00:00.000Z",
            slot_limit: 1,
            num_slots: 4
        });

    eventId = eventResponse.body.event._id;
    console.log(eventId);
    expect(eventId).toBeTruthy();
});

afterEach(async () => {
    await mongoose.connection.close();
});

describe('RSVP Flow', () => {
    it('should allow a user to RSVP to an event', async () => {
        const rsvpResponse = await request(app)
            .post(`/api/events/${eventId}/rsvp`)
            .send({ 
                userId: userId,
                ticketData: [{
                    first_name: "John",
                    last_name: 'Doe',
                    gender_identity: 'he/him',
                    from_where: 'discord',
                    expected_spend: '$20',
                    raffle_slot: 2
                }]
             });

        expect(rsvpResponse.status).toBe(200);
        expect(rsvpResponse.body.message).toBe('RSVP successful');

        // Verify the RSVP is stored in the database
        const ticket = await TicketModel.findOne({ ownerId: userId, eventId: eventId });
        expect(ticket).toBeTruthy();
    });
});
