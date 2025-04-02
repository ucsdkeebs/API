import { Request, Response } from "express";
import Event from "../models/eventModel";
import mongoose from "mongoose";
import { createTicketService } from "../services/ticketServices";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};

export const getActiveEvents = async (req: Request, res: Response) => {
  try {
    const allEvents = await Event.find();
    const activeEvents = allEvents.filter((event) => event.is_active());
    res.status(200).json(activeEvents);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const data = {
      name: req.body.name,
      max_attendees: req.body.max_attendees,
      max_rsvps: req.body.max_rsvps,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      slot_limit: req.body.slot_limit,
      num_slots: req.body.num_slots,
      description: req.body.description,
      image_link: req.body.image_link,
    };
    const event = new Event(data);

    const result = await event.save();
    res.status(201).json({ event: result });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const rsvpToEvent = async (req: Request, res: Response) => {
  const { eventId, userId, ticketData, keyboardData } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const responseMessage = await event.rsvp_to_event(
      userId,
      ticketData.raffle_slot,
      ticketData.keyboards
    );

    const newTicket = await createTicketService(
      eventId,
      userId,
      ticketData,
      keyboardData
    );

    //update event with new list of valid tickets
    event.tickets.push(newTicket._id as mongoose.Types.ObjectId);
    await event.save();

    res.status(200).json({ message: responseMessage });
  } catch (error) {
    res.status(500).json({ error: "Error processing RSVP" });
  }
};
