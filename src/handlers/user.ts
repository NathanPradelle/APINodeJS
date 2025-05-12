import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { User } from "../db/models/user";
import { Ticket } from "../db/models/ticket";

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   balance:
 *                     type: number
 *       403:
 *         description: Accès interdit
 */
export const listUsers: RequestHandler = async (_, res) => {
    const repo = AppDataSource.getRepository(User);
    const users = await repo.find({
        select: ["id", "email", "role", "balance"]
    });
    res.status(200).send(users);
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Détails d’un utilisateur (admin only)
 *     tags: [Users]
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
 *         description: Détails utilisateur, tickets utilisés, films vus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 balance:
 *                   type: number
 *                 ticketsUsed:
 *                   type: integer
 *                 filmsSeen:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       403:
 *         description: Accès interdit
 */
export const getUserDetails: RequestHandler = async (req, res) => {
    const userId = parseInt(req.params.id);

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
    }

    const ticketRepo = AppDataSource.getRepository(Ticket);
    const tickets = await ticketRepo.find({
        where: { user: { id: userId }, isUsed: true },
        relations: ["session", "session.movie"]
    });

    const filmsVus = [...new Set(tickets.map(t => t.session.movie.title))];

    res.status(200).send({
        id: user.id,
        email: user.email,
        role: user.role,
        balance: user.balance,
        ticketsUsed: tickets.length,
        filmsSeen: filmsVus
    });
};
