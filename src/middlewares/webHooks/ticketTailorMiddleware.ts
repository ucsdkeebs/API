import { Request, Response, NextFunction } from 'express';
import { verifyTicketTailorSignature } from '@/utils/ticketTailorSignature';
import { sign } from 'crypto';

export function ticketTailorWebhookAuth(req: any, res: any, next: any) {
    const header = req.get("TicketTailor-Webhook-Sginature");
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