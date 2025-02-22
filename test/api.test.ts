import request from 'supertest';
import { describe, it, beforeEach, afterEach, beforeAll, vi, expect } from 'vitest';
import app from '../src/app';

import User from '../src/models/userModel';
import Event from '../src/models/eventModel';
import { createTicketService } from '../src/services/ticketServices';
import keyboardRoutes from '../src/routes/keyboardRoutes';

// Instead of using require, import the firebase admin config using ES module syntax.
import admin from '../src/config/firebaseConfig';
import { Auth } from 'firebase-admin/auth';

// Mount the keyboard routes so that they are testable.
app.use('/api/keyboard', keyboardRoutes);

vi.mock('../src/services/ticketServices', () => ({
  createTicketService: vi.fn(),
}));

// -------------------------------------------------------------------
// User Routes Tests (Success Cases)
// -------------------------------------------------------------------
describe('User Routes - Success Cases', () => {
  describe('POST /api/users/create-user', () => {
    beforeEach(() => {
      // Stub the save method so that creating a user always "succeeds."
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
// User Routes Edge Cases and Verify Tests
// -------------------------------------------------------------------
describe('User Routes - Edge Cases', () => {
  describe('POST /api/users/create-user', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if user save fails', async () => {
      vi.spyOn(User.prototype, 'save').mockRejectedValue(new Error('save error'));
      const res = await request(app)
        .post('/api/users/create-user')
        .send({
          email: 'fail@example.com',
          username: 'failuser',
          discord_id: '000',
          ucsd_affiliation: 'student',
          pronouns: 'they/them',
          year: 2024,
          major: 'Art'
        });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error creating user');
    });
  });

  describe('GET /api/users/get-users', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if error retrieving users', async () => {
      vi.spyOn(User, 'find').mockRejectedValue(new Error('find error'));
      const res = await request(app).get('/api/users/get-users');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error retrieving users.');
    });
  });

  // -------------------------------------------------------------------
  // User Verify Endpoint Tests
  // -------------------------------------------------------------------
  describe('GET /api/users/verify', () => {
    const userPayload = { uid: 'test-uid', email: 'test@example.com' };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return 401 if no authorization token is provided', async () => {
      const res = await request(app).get('/api/users/verify');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized Login');
    });

    it('should return 403 if token verification fails', async () => {
      // Stub admin.auth().verifyIdToken to throw an error.
      const fakeAuth = {
        verifyIdToken: vi.fn().mockRejectedValue(new Error('Invalid token')),
      } as unknown as Auth;
      vi.spyOn(admin, 'auth').mockReturnValue(fakeAuth);
      
      const res = await request(app)
        .get('/api/users/verify')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });

    it('should redirect new users to registration', async () => {
      // Stub admin.auth().verifyIdToken to return a valid uid.
      const fakeAuth = {
        verifyIdToken: vi.fn().mockResolvedValue({ uid: 'new-user-uid' }),
      } as unknown as Auth;
      vi.spyOn(admin, 'auth').mockReturnValue(fakeAuth);
      // Stub User.findOne to return null (user not found).
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      
      const res = await request(app)
        .get('/api/users/verify')
        .set('Authorization', 'Bearer validtoken');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('redirect', '/new-user-registration');
    });

    it('should return secure data for existing users', async () => {
      // Stub admin.auth().verifyIdToken to return a valid uid.
      const fakeAuth = {
        verifyIdToken: vi.fn().mockResolvedValue({ uid: userPayload.uid }),
      } as unknown as Auth;
      vi.spyOn(admin, 'auth').mockReturnValue(fakeAuth);
      // Stub User.findOne to return a user object.
      vi.spyOn(User, 'findOne').mockResolvedValue({ ...userPayload } as any);

      const res = await request(app)
        .get('/api/users/verify')
        .set('Authorization', 'Bearer validtoken');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Secure data');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({ uid: userPayload.uid });
    });
  });
});

// -------------------------------------------------------------------
// Ticket Routes Tests (Success Cases)
// -------------------------------------------------------------------
describe('Ticket Routes - Success Cases', () => {
  describe('POST /api/tickets/create', () => {
    beforeEach(() => {
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
        checked_in: false,
        raffle_slot: 1
      };
      const res = await request(app).post('/api/tickets/create').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ticketId', 'test-ticket-id');
    });
  });
});

// -------------------------------------------------------------------
// Ticket Routes Edge Cases
// -------------------------------------------------------------------
describe('Ticket Routes - Edge Cases', () => {
  describe('POST /api/tickets/create', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if createTicketService fails', async () => {
      (createTicketService as any).mockRejectedValue(new Error('TicketService failed'));
      const payload = {
        ticket_number: 'T999',
        ownerId: 'user999',
        eventId: 'event999',
        first_name: 'Fail',
        last_name: 'Case',
        keyboards: ['keyboard_fail'],
        gender_identity: 'non-binary',
        from_where: 'Nowhere',
        expected_spend: 0,
        checked_in: false,
        raffle_slot: 1
      };
      const res = await request(app).post('/api/tickets/create').send(payload);
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error creating ticket');
    });
  });
});

// -------------------------------------------------------------------
// Event Routes Tests (Success Cases)
// -------------------------------------------------------------------
describe('Event Routes - Success Cases', () => {
  describe('GET /api/events/all', () => {
    beforeEach(() => {
      vi.spyOn(Event, 'find').mockResolvedValue([
        { _id: 'event1', name: 'Event One', is_active: () => true },
        { _id: 'event2', name: 'Event Two', is_active: () => false }
      ] as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return all events', async () => {
      const res = await request(app).get('/api/events/all');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/events/get-active', () => {
    beforeEach(() => {
      const activeEvent = { _id: 'event-active', name: 'Active Event', is_active: () => true };
      const inactiveEvent = { _id: 'event-inactive', name: 'Inactive Event', is_active: () => false };
      vi.spyOn(Event, 'find').mockResolvedValue([activeEvent, inactiveEvent] as any);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return only active events', async () => {
      const res = await request(app).get('/api/events/get-active');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('name', 'Active Event');
    });
  });

  describe('POST /api/events/create', () => {
    beforeEach(() => {
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
        end_date: new Date(Date.now() + 3600000).toISOString()
      };
      const res = await request(app).post('/api/events/create').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'New Event');
    });
  });

  describe('POST /api/events/rsvp', () => {
    beforeEach(() => {
      const fakeEvent = {
        _id: 'event1',
        rsvp_to_event: vi.fn().mockResolvedValue('RSVP successful'),
        tickets: [],
        save: vi.fn().mockResolvedValue(true)
      };
      vi.spyOn(Event, 'findById').mockResolvedValue(fakeEvent as any);
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
      const res = await request(app).post('/api/events/rsvp').send(payload);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'RSVP successful');
    });
  });
});

// -------------------------------------------------------------------
// Event Routes Edge Cases
// -------------------------------------------------------------------
describe('Event Routes - Edge Cases', () => {
  describe('GET /api/events/all', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if error retrieving events', async () => {
      vi.spyOn(Event, 'find').mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/events/all');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error retrieving users');
    });
  });

  describe('GET /api/events/get-active', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if error retrieving active events', async () => {
      vi.spyOn(Event, 'find').mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/events/get-active');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error retrieving users');
    });
  });

  describe('POST /api/events/create', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 500 if event creation fails', async () => {
      vi.spyOn(Event.prototype, 'save').mockRejectedValue(new Error('save error'));
      const payload = {
        name: 'Faulty Event',
        max_attendees: 10,
        max_rsvps: 5,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 3600000).toISOString()
      };
      const res = await request(app).post('/api/events/create').send(payload);
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error creating user');
    });
  });

  describe('POST /api/events/rsvp', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 404 if event is not found', async () => {
      vi.spyOn(Event, 'findById').mockResolvedValue(null);
      const payload = {
        eventId: 'nonexistent',
        userId: 'user1',
        ticketData: {
          raffle_slot: 1,
          keyboards: ['keyboard1']
        },
        keyboardData: {}
      };
      const res = await request(app).post('/api/events/rsvp').send(payload);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Event not found');
    });

    it('should return 500 if createTicketService fails during RSVP', async () => {
      const fakeEvent = {
        _id: 'event1',
        rsvp_to_event: vi.fn().mockResolvedValue('RSVP processed'),
        tickets: [],
        save: vi.fn().mockResolvedValue(true)
      };
      vi.spyOn(Event, 'findById').mockResolvedValue(fakeEvent as any);
      (createTicketService as any).mockRejectedValue(new Error('TicketService error'));
      const payload = {
        eventId: 'event1',
        userId: 'user1',
        ticketData: {
          raffle_slot: 1,
          keyboards: ['keyboard1']
        },
        keyboardData: {}
      };
      const res = await request(app).post('/api/events/rsvp').send(payload);
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error processing RSVP');
    });

    it('should return 500 if event ticket update fails after RSVP', async () => {
      const fakeEvent = {
        _id: 'event1',
        rsvp_to_event: vi.fn().mockResolvedValue('RSVP processed'),
        tickets: [],
        save: vi.fn().mockRejectedValue(new Error('event save failed'))
      };
      vi.spyOn(Event, 'findById').mockResolvedValue(fakeEvent as any);
      (createTicketService as any).mockResolvedValue({ _id: 'ticket-rsvp-id' });
      const payload = {
        eventId: 'event1',
        userId: 'user1',
        ticketData: {
          raffle_slot: 1,
          keyboards: ['keyboard1']
        },
        keyboardData: {}
      };
      const res = await request(app).post('/api/events/rsvp').send(payload);
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error processing RSVP');
    });
  });
});

// -------------------------------------------------------------------
// Keyboard Routes Tests
// -------------------------------------------------------------------
describe('Keyboard Routes', () => {
  // Success Cases
  describe('POST /api/keyboards/create - Success', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should create keyboards and return success message along with keyboardIds', async () => {
      // Stub the createKeyboards function in keyboardServices.
      const keyboardServices = await import('../src/services/keyboardServices');
      vi.spyOn(keyboardServices, 'createKeyboards').mockResolvedValue(['kb1', 'kb2']);
      const payload = {
        keyboards: [
          { keyboard_name: 'Test Keyboard 1', switch_name: 'Cherry', layout: '60%', modded: false },
          { keyboard_name: 'Test Keyboard 2', switch_name: 'Gateron', layout: '65%', modded: true }
        ]
      };
      const res = await request(app).post('/api/keyboards/create').send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Keyboards created successfully');
      expect(res.body).toHaveProperty('keyboardIds');
      expect(Array.isArray(res.body.keyboardIds)).toBe(true);
      expect(res.body.keyboardIds).toEqual(['kb1', 'kb2']);
    });
  });

  // Edge Cases
  describe('POST /api/keyboards/create - Edge Cases', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return 400 if keyboards field is missing', async () => {
      const res = await request(app).post('/api/keyboards/create').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid input: keyboards must be an array');
    });
    it('should return 500 if createKeyboards fails', async () => {
      const keyboardServices = await import('../src/services/keyboardServices');
      vi.spyOn(keyboardServices, 'createKeyboards').mockRejectedValue(new Error('KeyboardService error'));
      const res = await request(app)
        .post('/api/keyboards/create')
        .send({
          keyboards: [{ keyboard_name: 'Test', switch_name: 'Cherry', layout: '60%', modded: false }]
        });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'KeyboardService error');
    });
  });
});
