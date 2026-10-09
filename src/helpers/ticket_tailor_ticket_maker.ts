const axios = require('axios');
require("dotenv").config();

//use to avoid issues with having process.env providing String | None, None type causing issues
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const EVENT_ID = requireEnv('EVENT_ID');
const API_KEY = requireEnv('TICKETTAILOR_API_KEY');

//from api, 'tt_6207669' is General Admission
async function createTestAttendees() {
    const tickets = [];

    for (let i = 2; i < 302; i++) {
        tickets.push({
          ticket_type_id: "tt_6207669",
          quantity: 1,
      
          first_name: "Ticket",
          last_name: `Number${i}`,
          email: `test${i}@example.com`,
      
          answers: [
            {
              question: "Raffle Slot?",
              answer: i < 152 ? "1 (6:00 - 6:30)" : "2 (6:30 - 7:00)"
            }
          ]
        });
      }
      
      await axios.post(
        "https://api.tickettailor.com/v1/orders",
        {
          event_id: EVENT_ID,
          email: "bulkorder@example.com",
          tickets
        },
        {
          auth: {
            username: API_KEY,
            password: ""
          }
        }
      );
}

createTestAttendees();