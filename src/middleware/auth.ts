import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Token } from "../db/models/token";
import { verify } from "jsonwebtoken";

export const authMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const tokenRepo = AppDataSource.getRepository(Token);
        const tokenFound = await tokenRepo.findOne({ where: { token } });

        if (!tokenFound) {
            res.status(403).send({ message: "Access Forbidden" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET!;

        try {
            const payload = verify(token, jwtSecret);
            (req as any).userId = (payload as any).userId;
            return next();
        } catch (err) {
            res.status(403).send({ message: "Access Forbidden" });
            return
        }

    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
        return
    }
};

