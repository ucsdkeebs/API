export {}; //used to convert script to module so it doesnt exist in global scope and get mad for const

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

//use this api call to get ticket info to see what the ticket types ids are called
//helpful for calling other functions in the TicketTailorAPI
async function get_event_info() {
    const res = await axios.get(
        `https://api.tickettailor.com/v1/events/${EVENT_ID}`,
        {
            auth: {
                username: API_KEY,
                password: ""
            }
        }
    );

    console.log(res.data);
};

//it_121678211

async function get_order_info() {
    var orders = 'or_74702262' //or_74702303
    const res = await axios.get(
        `https://api.tickettailor.com/v1/orders/${orders}`,
        {
            auth: {
                username: API_KEY,
                password: ""
            }
        }
    );

    console.log(res.data.issued_tickets[0].custom_questions);
}

// async function get_ticket_info() {
//     const res = await axios.get(
//         `https://api.tickettailor.com/v1/`
//     )
// }

get_event_info();

//get_order_info();

//console.log('\n\n\n----------------------\n\n\n');
