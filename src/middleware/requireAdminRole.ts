import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { User } from "../db/models/user";

export const requireAdminRole: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).userId;

        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        if (!user || user.role !== "admin") {
            res.status(403).send({ message: "Admin access required" });
            return;
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
};
