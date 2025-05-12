import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Movie } from "../db/models/movie";
import { createMovieValidation } from "./validators/movie/create-movie";
import { updateMovieValidation } from "./validators/movie/update-movie";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Liste tous les films
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Liste des films
 */
export const listMovies: RequestHandler = async (_, res) => {
    const repo = AppDataSource.getRepository(Movie);
    const movies = await repo.find();
    res.status(200).send(movies);
};

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Obtenir un film par son ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film trouvé
 *       404:
 *         description: Film non trouvé
 */
export const getMovie: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Movie);
    const movie = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!movie) {
        res.status(404).send({ message: "Movie not found" });
        return;
    }
    res.status(200).send(movie);
};

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Créer un nouveau film
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - synopsis
 *               - duration
 *               - genres
 *             properties:
 *               title:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               duration:
 *                 type: integer
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Film créé
 *       400:
 *         description: Données invalides
 */
export const createMovie: RequestHandler = async (req, res) => {
    const validation = createMovieValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const repo = AppDataSource.getRepository(Movie);
    const movie = repo.create(validation.value);
    const saved = await repo.save(movie);
    res.status(201).send(saved);
};

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Mettre à jour un film
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               duration:
 *                 type: integer
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Film mis à jour
 *       404:
 *         description: Film non trouvé
 */
export const updateMovie: RequestHandler = async (req, res) => {
    const validation = updateMovieValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const repo = AppDataSource.getRepository(Movie);
    const movie = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!movie) {
        res.status(404).send({ message: "Movie not found" });
        return;
    }

    repo.merge(movie, validation.value);
    const updated = await repo.save(movie);
    res.status(200).send(updated);
};

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Supprimer un film
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Film supprimé
 *       404:
 *         description: Film non trouvé
 */
export const deleteMovie: RequestHandler = async (req, res) => {
    const repo = AppDataSource.getRepository(Movie);
    const movie = await repo.findOneBy({ id: parseInt(req.params.id) });
    if (!movie) {
        res.status(404).send({ message: "Movie not found" });
        return;
    }

    await repo.remove(movie);
    res.status(204).send();
};
