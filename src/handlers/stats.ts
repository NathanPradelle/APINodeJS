import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Session } from "../db/models/session";
import { Ticket } from "../db/models/ticket";

/**
 * @swagger
 * /stats/frequency:
 *   get:
 *     summary: Obtenir la fréquentation globale (nombre total de tickets)
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Nombre total de tickets émis
 */
export const globalFrequencyStats: RequestHandler = async (_, res) => {
    const count = await AppDataSource.getRepository(Ticket).count();
    res.status(200).send({ totalTickets: count });
};

/**
 * @swagger
 * /stats/frequency/room/{id}:
 *   get:
 *     summary: Obtenir la fréquentation d'une salle
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nombre de tickets émis pour cette salle
 */
export const roomFrequencyStats: RequestHandler = async (req, res) => {
    const roomId = parseInt(req.params.id);
    const count = await AppDataSource
        .getRepository(Ticket)
        .createQueryBuilder("ticket")
        .leftJoin("ticket.session", "session")
        .where("session.roomId = :roomId", { roomId })
        .getCount();

    res.status(200).send({ roomId, ticketCount: count });
};

/**
 * @swagger
 * /stats/frequency/period:
 *   get:
 *     summary: Obtenir la fréquentation sur une période donnée
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Nombre de tickets entre deux dates
 *       400:
 *         description: Paramètres manquants
 */
export const periodFrequencyStats: RequestHandler = async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400).send({ message: "Missing from or to date" });
        return;
    }

    const count = await AppDataSource
        .getRepository(Ticket)
        .createQueryBuilder("ticket")
        .leftJoin("ticket.session", "session")
        .where("session.startTime BETWEEN :from AND :to", {
            from: new Date(from as string),
            to: new Date(to as string)
        })
        .getCount();

    res.status(200).send({ from, to, ticketCount: count });
};
