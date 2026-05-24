import {Request, Response} from "express";

import User from '@/models/userModel';
import TicketTailorTicket from "../../models/ticketTailorTicketModel";

//helper method to get raffle slot from custom question in TicketTailor
const parseRaffleSlot = (payload: any): number | null => {
    const customQuestions = payload?.custom_questions;
    if (!Array.isArray(customQuestions)) {
        return null;
    }

    console.log(JSON.stringify(customQuestions[0]));

    const opportunityQuestion = customQuestions.find((question: any) =>
        typeof question?.question === "string" &&
        (question.question.toLowerCase().includes("opportunity") || question.question.toLowerCase().includes("raffle"))
    );

    if (!opportunityQuestion || typeof opportunityQuestion.answer !== "string") {
        return null;
    }

    // Expected formats like "1 (6:00 - 6:30)" or "Opportunity Draw 1 (6:00 - 6:30)" grabs first number as raffle slot
    const slotMatch = opportunityQuestion.answer.match(/\d+/);
    return slotMatch ? Number(slotMatch[0]) : null;
}

// should only be valid for urls from tickettailor
export const addCheckedInTicket = async (req: Request, res: Response) => {
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
        // const checkedIn = payload.checked_in;
        // if (!checkedIn) {
        //     return res.status(200);
        // }

        await TicketTailorTicket.updateOne(
            { ticketTailorId: ticketId },
            {
                $set: {
                    eventId: payload.event_id,
                    email: payload.email,
                    full_name: payload.full_name,
                    checked_in: payload.checked_in,
                },
                $setOnInsert: {
                    ticketTailorId: ticketId,
                    raffle_slot: parseRaffleSlot(payload),
                    won: false,
                }
            },
            { upsert: true }
        );

        return res.status(200);
    } catch {
        return res.status(500).json({error: "Issue adding checked in TicketTailorTicket"});
    }
}

export const getCheckedInTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await TicketTailorTicket.find({checked_in: true});

        return res.status(200).json({tickets});
    } catch {
        return res.status(500).json({error: "Issue in retrieving "});
    }
}

export const getCheckedInNoWinTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await TicketTailorTicket.find({checked_in: true, eventId: process.env.EVENT_ID, won: false});

        return res.status(200).json({tickets});
    } catch {
        return res.status(500).json({error: "Issue in retrieving "});
    }
}

export const updateWinner = async(req: Request, res: Response) => {
    try {
        const { ticketTailorId } = req.params;

        const result = await TicketTailorTicket.updateOne(
            { ticketTailorId: ticketTailorId },
            {  won: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        return res.status(200).json({message: "Winner set successfully"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Issue in setting winner"});
    }
}

export const getCheckedInByRaffleSlot = async (req: Request, res: Response) => {
    try {
        const raffleSlot = Number(req.query.raffleSlot);
        const tickets = await TicketTailorTicket.find({checked_in: true, eventId: process.env.EVENT_ID, raffle_slot: raffleSlot, won: false});

        //if (raffleSlot == 1) {
        //    const nullTickets = await TicketTailorTicket.find({checked_in: true, raffle_slot: null, won: false});
        //    // not sure if this will work
        //    return res.status(200).json({tickets, nullTickets});
        //}

        return res.status(200).json({tickets});
    } catch {
        return res.status(500).json({error: "Issue in retrieving by Raffle Slot "});
    }
}