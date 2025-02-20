import request from 'supertest';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import app from '../src/app';

import User from '../src/models/userModel';
import Event from '../src/models/eventModel';
import { createTicketService } from '../src/services/ticketServices';

vi.mock('../src/services/ticketServices', () => ({
  createTicketService: vi.fn(),
}));

// -------------------------------------------------------------------
// User Routes Tests
// -------------------------------------------------------------------
describe('User Routes', () => {
  describe('POST /api/user/create-user', () => {
    beforeEach(() => {
      // Stub the instance save method so that creating a user always "succeeds."
      vi.spyOn(User.prototype, 'save').mockResolvedValue({ _id: 'test-user-id' } as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should create a user and return userId', async () => {
      const res = await request(app)
        .post('/api/users/create-user')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          ucsd_affiliation: 'student',
          pronouns: 'they/them',
          year: 2025,
          major: 'Computer Science'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userId', 'test-user-id');
      console.log(res.body);
    });
  });

  describe('GET /api/users/get-users', () => {
    beforeEach(() => {
      // Stub User.find to return a fake list of users.
      vi.spyOn(User, 'find').mockResolvedValue([
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' }
      ] as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return all users', async () => {
      // Note the corrected endpoint path here:
      const res = await request(app).get('/api/users/get-users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });
  });
});

// -------------------------------------------------------------------
// Ticket Routes Tests
// -------------------------------------------------------------------
describe('Ticket Routes', () => {
  describe('POST /api/tickets/create', () => {
    beforeEach(() => {
      // Stub createTicketService so that it returns a fake ticket.
      (createTicketService as any).mockResolvedValue({ _id: 'test-ticket-id' });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should create a ticket and return ticketId', async () => {
      const payload = {
        ticket_number: 'T123',
        ownerId: 'user1',
        eventId: 'event1',
        first_name: 'John',
        last_name: 'Doe',
        keyboards: ['keyboard1'],
        gender_identity: 'male',
        from_where: 'Discord',
        expected_spend: 100,
        checked_in: false
      };
      const res = await request(app)
        .post('/api/tickets/create')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ticketId', 'test-ticket-id');
    });
  });
});

// -------------------------------------------------------------------
// Event Routes Tests
// -------------------------------------------------------------------
describe('Event Routes', () => {
  describe('GET /api/events/all', () => {
    beforeEach(() => {
      // Stub Event.find to return a fake list of events.
      vi.spyOn(Event, 'find').mockResolvedValue([
        { _id: 'event1', name: 'Event One' },
        { _id: 'event2', name: 'Event Two' }
      ] as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return all events', async () => {
      // Corrected endpoint:
      const res = await request(app).get('/api/events/all');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/events/get-active', () => {
    beforeEach(() => {
      // Create fake events with an is_active method.
      const activeEvent = { _id: 'event-active', name: 'Active Event', is_active: () => true };
      const inactiveEvent = { _id: 'event-inactive', name: 'Inactive Event', is_active: () => false };
      vi.spyOn(Event, 'find').mockResolvedValue([activeEvent, inactiveEvent] as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return only active events', async () => {
      // Corrected endpoint:
      const res = await request(app).get('/api/events/get-active');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Only the active event should be returned.
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('name', 'Active Event');
    });
  });

  describe('POST /api/events/create', () => {
    beforeEach(() => {
      // Stub the save method on an Event instance.
      vi.spyOn(Event.prototype, 'save').mockResolvedValue({ _id: 'new-event-id', name: 'New Event' } as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should create an event and return the event data', async () => {
      const payload = {
        name: 'New Event',
        max_attendees: 100,
        max_rsvps: 50,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3600000).toISOString() // one hour later
      };
      const res = await request(app)
        .post('/api/events/create')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'New Event');
    });
  });

  describe('POST /api/events/rsvp', () => {
    beforeEach(() => {
      // Stub Event.findById to return a fake event with the expected methods.
      const fakeEvent = {
        _id: 'event1',
        rsvp_to_event: vi.fn().mockResolvedValue('RSVP successful'),
        tickets: [] as any[],
        save: vi.fn().mockResolvedValue(true)
      };
      vi.spyOn(Event, 'findById').mockResolvedValue(fakeEvent as any);
      
      // Stub createTicketService for processing the RSVP.
      (createTicketService as any).mockResolvedValue({ _id: 'ticket-rsvp-id' });
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should process RSVP and return success message', async () => {
      const payload = {
        eventId: 'event1',
        userId: 'user1',
        ticketData: {
          raffle_slot: 1,
          keyboards: ['keyboard1']
        },
        keyboardData: {}
      };
      const res = await request(app)
        .post('/api/events/rsvp')
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'RSVP successful');
    });
  });
});
