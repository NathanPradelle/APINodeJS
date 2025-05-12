import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Ticket } from "../db/models/ticket";
import { Session } from "../db/models/session";
import { User } from "../db/models/user";
import { createTicketValidation } from "./validators/ticket/create-ticket";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";


/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Liste les tickets de l'utilisateur connecté
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tickets
 */
export const listTickets: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    const repo = AppDataSource.getRepository(Ticket);
    const tickets = await repo.find({
        where: { user: { id: userId } },
        relations: ["session", "session.movie", "session.room"]
    });
    res.status(200).send(tickets);
};

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Acheter un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: integer
 *               isSuperTicket:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Ticket acheté
 *       400:
 *         description: Données invalides
 */
export const buyTicket: RequestHandler = async (req, res) => {
    const validation = createTicketValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const { sessionId, isSuperTicket = false } = validation.value;
    const session = await AppDataSource.getRepository(Session).findOne({
        where: { id: sessionId },
        relations: ["room"]
    });
    const user = await AppDataSource.getRepository(User).findOneBy({ id: (req as any).userId });

    if (!session || !user) {
        res.status(400).send({ message: "Invalid session or user" });
        return;
    }

    if (session.room.isInMaintenance) {
        res.status(400).send({ message: "Impossible d'acheter un billet : salle en maintenance" });
        return;
    }

    const ticketPrice = isSuperTicket ? 30 : 5;
    if (user.balance < ticketPrice) {
        res.status(400).send({ message: "Solde insuffisant" });
        return;
    }

    // Débit du solde
    user.balance -= ticketPrice;

    const ticket = AppDataSource.getRepository(Ticket).create({
        user,
        session,
        isSuperTicket,
        isUsed: false,
        remainingUses: isSuperTicket ? 10 : 1
    });

    await AppDataSource.getRepository(User).save(user);
    const saved = await AppDataSource.getRepository(Ticket).save(ticket);
    res.status(201).send(saved);
};


/**
 * @swagger
 * /tickets/{id}/use:
 *   post:
 *     summary: Valider un ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket validé
 *       400:
 *         description: Déjà utilisé
 *       404:
 *         description: Ticket non trouvé
 */
export const useTicket: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Ticket);
    const ticket = await repo.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["user"]
    });

    if (!ticket) {
        res.status(404).send({ message: "Ticket not found" });
        return;
    }

    if (ticket.remainingUses <= 0 || ticket.isUsed) {
        res.status(400).send({ message: "Ticket déjà utilisé ou invalide" });
        return;
    }

    // On consomme un usage
    ticket.remainingUses -= 1;

    if (ticket.remainingUses === 0) {
        ticket.isUsed = true;
    }

    const updated = await repo.save(ticket);
    res.status(200).send(updated);
};

