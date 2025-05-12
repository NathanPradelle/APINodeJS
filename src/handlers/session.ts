import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Session } from "../db/models/session";
import { Room } from "../db/models/room";
import { Movie } from "../db/models/movie";
import { createSessionValidation } from "./validators/session/create-session";
import { updateSessionValidation } from "./validators/session/update-session";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Liste toutes les séances
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Liste des séances
 */
export const listSessions: RequestHandler = async (_, res) => {
    const repo = AppDataSource.getRepository(Session);
    const sessions = await repo.find({ relations: ["room", "movie"] });
    res.status(200).send(sessions);
};

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Obtenir une séance par son ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Séance trouvée
 *       404:
 *         description: Séance non trouvée
 */
export const getSession: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ["room", "movie"]
    });
    if (!session) {
        res.status(404).send({ message: "Session not found" });
        return;
    }
    res.status(200).send(session);
};

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Créer une nouvelle séance
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - roomId
 *               - startTime
 *               - endTime
 *             properties:
 *               movieId:
 *                 type: integer
 *               roomId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Séance créée
 *       400:
 *         description: Données invalides
 */
export const createSession: RequestHandler = async (req, res) => {
    const validation = createSessionValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const { roomId, movieId, startTime, endTime } = validation.value;
    const sessionRepo = AppDataSource.getRepository(Session);
    const room = await AppDataSource.getRepository(Room).findOneBy({ id: roomId });
    const movie = await AppDataSource.getRepository(Movie).findOneBy({ id: movieId });

    if (!room || !movie) {
        res.status(400).send({ message: "Invalid room or movie ID" });
        return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (startDate < oneMonthLater) {
        res.status(400).send({ message: "Les séances doivent être planifiées au moins 1 mois à l’avance" });
        return;
    }

    const filmDuration = movie.duration;
    const actualDuration = (endDate.getTime() - startDate.getTime()) / 60000;
    if (actualDuration < filmDuration + 30) {
        res.status(400).send({ message: "La séance doit durer au moins la durée du film + 30 minutes" });
        return;
    }

    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    if (startHour < 9 || endHour > 20) {
        res.status(400).send({ message: "Les séances doivent être planifiées entre 9h et 20h" });
        return;
    }

    if (room.isInMaintenance) {
        res.status(400).send({ message: "Salle en maintenance, impossible de créer une séance" });
        return;
    }

    const overlapInSameRoom = await sessionRepo.createQueryBuilder("session")
        .where("session.roomId = :roomId", { roomId })
        .andWhere("session.startTime < :end AND session.endTime > :start", {
            start: startTime,
            end: endTime
        })
        .getCount();

    if (overlapInSameRoom > 0) {
        res.status(400).send({ message: "Chevauchement avec une autre séance dans cette salle" });
        return;
    }

    const overlapSameMovie = await sessionRepo.createQueryBuilder("session")
        .where("session.movieId = :movieId", { movieId })
        .andWhere("session.startTime < :end AND session.endTime > :start", {
            start: startTime,
            end: endTime
        })
        .getCount();

    if (overlapSameMovie > 0) {
        res.status(400).send({ message: "Ce film est déjà diffusé à cet horaire dans une autre salle" });
        return;
    }

    const session = sessionRepo.create({
        startTime,
        endTime,
        room,
        movie
    });

    const saved = await sessionRepo.save(session);
    res.status(201).send(saved);
};


/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Mettre à jour une séance
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: integer
 *               roomId:
 *                 type: integer
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Séance mise à jour
 *       404:
 *         description: Séance non trouvée
 */
export const updateSession: RequestHandler = async (req, res) => {
    const validation = updateSessionValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOne({ where: { id: parseInt(req.params.id) }, relations: ["room", "movie"] });

    if (!session) {
        res.status(404).send({ message: "Session not found" });
        return;
    }

    if (validation.value.roomId) {
        const room = await AppDataSource.getRepository(Room).findOneBy({ id: validation.value.roomId });
        if (!room) {
            res.status(400).send({ message: "Invalid room ID" });
            return;
        }
        session.room = room;
    }

    if (validation.value.movieId) {
        const movie = await AppDataSource.getRepository(Movie).findOneBy({ id: validation.value.movieId });
        if (!movie) {
            res.status(400).send({ message: "Invalid movie ID" });
            return;
        }
        session.movie = movie;
    }

    session.startTime = validation.value.startTime ?? session.startTime;
    session.endTime = validation.value.endTime ?? session.endTime;

    const updated = await repo.save(session);
    res.status(200).send(updated);
};


/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Supprimer une séance
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Séance supprimée
 *       404:
 *         description: Séance non trouvée
 */
export const deleteSession: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!session) {
        res.status(404).send({ message: "Session not found" });
        return;
    }

    await repo.remove(session);
    res.status(204).send();
};
