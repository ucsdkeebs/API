import { Request, Response, NextFunction } from 'express';
import { verifyTicketTailorSignature } from '@/utils/ticketTailorSignature';
import { sign } from 'crypto';

export function ticketTailorWebhookAuth(req: any, res: any, next: any) {
    console.log("Ticket Tailor webhook auth hit:", {
        path: req.originalUrl,
        method: req.method,
        signatureHeaderPresent: Boolean(req.get("TicketTailor-Webhook-Signature")),
    });

    const header = req.get("TicketTailor-Webhook-Signature");
    const secret = process.env.TICKETTAILOR_WEBHOOK_SECRET;

    const result = verifyTicketTailorSignature({
        rawBody: req.rawBody,
        signatureHeader: header,
        secret: secret
    });

    if (!result.ok) {
        return res.status(401).json({ error: 'Invalid webhook signature', detail: result.reason });
    }

    next();
}