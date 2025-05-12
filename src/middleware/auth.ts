import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Token } from "../db/models/token";
import { verify } from "jsonwebtoken";

export const authMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("⛔ Pas de header Authorization");
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            console.log("⛔ Mauvais format Authorization");
            res.status(401).send({ message: "Unauthorized" });
            return;
        }

        console.log("🔐 JWT reçu dans header:", token);

        const tokenRepo = AppDataSource.getRepository(Token);
        const tokenFound = await tokenRepo.findOne({ where: { token } });

        if (!tokenFound) {
            console.log("⛔ Token non trouvé en base");
            res.status(403).send({ message: "Access Forbidden" });
            return;
        }

        console.log("✅ Token trouvé en base");

        const jwtSecret = process.env.JWT_SECRET!;
        console.log("🔐 Vérification JWT avec le secret :", jwtSecret);

        try {
            const payload = verify(token, jwtSecret);
            console.log("✅ JWT décodé :", payload);
            (req as any).userId = (payload as any).userId;
            return next();
        } catch (err) {
            console.error("❌ verify() a échoué :", err);
            res.status(403).send({ message: "Access Forbidden" });
            return
        }

    } catch (error) {
        console.error("❌ Erreur serveur middleware :", error);
        res.status(500).send({ message: "Internal server error" });
        return
    }
};

