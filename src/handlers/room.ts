import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Room } from "../db/models/room";
import { createRoomValidation } from "./validators/room/create-room";
import { updateRoomValidation } from "./validators/room/update-room";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Liste toutes les salles
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Liste des salles
 */
export const listRooms: RequestHandler = async (_, res) => {
    const repo = AppDataSource.getRepository(Room);
    const rooms = await repo.find();
    res.status(200).send(rooms);
};

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Obtenir une salle par son ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salle trouvée
 *       404:
 *         description: Salle non trouvée
 */
export const getRoom: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Room);
    const room = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!room) {
        res.status(404).send({ message: "Room not found" });
        return;
    }
    res.status(200).send(room);
};

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Créer une nouvelle salle
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - images
 *               - type
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               isAccessible:
 *                 type: boolean
 *               isInMaintenance:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Salle créée
 *       400:
 *         description: Données invalides
 */
export const createRoom: RequestHandler = async (req, res) => {
    const validation = createRoomValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const repo = AppDataSource.getRepository(Room);
    const room = repo.create(validation.value);
    const saved = await repo.save(room);
    res.status(201).send(saved);
};

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Mettre à jour une salle
 *     tags: [Rooms]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               isAccessible:
 *                 type: boolean
 *               isInMaintenance:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Salle mise à jour
 *       404:
 *         description: Salle non trouvée
 */
export const updateRoom: RequestHandler = async (req, res) => {
    const validation = updateRoomValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const repo = AppDataSource.getRepository(Room);
    const room = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!room) {
        res.status(404).send({ message: "Room not found" });
        return;
    }

    repo.merge(room, validation.value);
    const updated = await repo.save(room);
    res.status(200).send(updated);
};

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Supprimer une salle
 *     tags: [Rooms]
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
 *         description: Salle supprimée
 *       404:
 *         description: Salle non trouvée
 */
export const deleteRoom: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Room);
    const room = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!room) {
        res.status(404).send({ message: "Room not found" });
        return;
    }

    await repo.remove(room);
    res.status(204).send();
};
