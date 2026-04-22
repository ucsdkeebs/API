import {Request, Response} from "express";

import TicketTailorTicket from "../../models/ticketTailorTicketModel";

const addCheckedInTicket = async (req: Request, res: Response) => {
    try {
        console.log("Ticket Tailor webhook payload:", req.body);
        const { id, event, payload } = req.body;

        //make sure to only add when an already issued ticket is updated
        if (event !== "ISSUED_TICKET.UPDATED") {
            return res.status(200).json({ error: "Unsupported event type" });
        }

        //makes sure that ticket id exists
        const ticketId = payload?.id
        if (!ticketId) {
            return res.status(200);
        }

        //skips if ticket is not checked in
        const checkedIn = payload.checked_in;
        if (!checkedIn) {
            return res.status(200);
        }

        await TicketTailorTicket.updateOne(
            { ticketTailorId: ticketId },
            {
                ticketTailorId: ticketId,
                eventId: payload.event_id,
                email: payload.email,
                full_name: payload.full_name,
                checked_in: payload.checked_in,
                raffle_slot: 1 /*need a func to parse data */
            },
            {upsert: true}
        );

        return res.status(200);
    } catch {
        return res.status(500);
    }
}

export default addCheckedInTicket;