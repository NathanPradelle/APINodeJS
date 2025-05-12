import { Request, Response, RequestHandler } from "express";
import { createUserValidation, LoginUserValidation } from "./validators/auth/create-user";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { compare, hash } from "bcrypt";
import { AppDataSource } from "../db/database";
import { User } from "../db/models/user";
import { QueryFailedError } from "typeorm";
import { sign } from "jsonwebtoken";
import { Token } from "../db/models/token";
import { verify } from "jsonwebtoken";

export const createUser = async(req: Request, res: Response) => {
    try{
        const validation = createUserValidation.validate(req.body)
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const createUserRequest = validation.value
        const hashedPassword = await hash(createUserRequest.password, 10)
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.save({
            email: createUserRequest.email,
            password: hashedPassword
        })
        res.status(201).send({
            id: user.id,
            email: user.email,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        })
        
    } catch(error) {
        if (error instanceof QueryFailedError && error.driverError.code === "23505") {
            res.status(400).send({"message": "email already exist"})
        }
        if (error instanceof Error) {
            console.log(error.message)
        }
        res.status(500).send({"message": "internal error"})
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const validation = LoginUserValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { email, password } = validation.value;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (!user || !(await compare(password, user.password))) {
            res.status(400).send({ message: "email or password not valid" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET!;
        const accessToken = sign(
            { userId: user.id, email: user.email },
            jwtSecret,
            { expiresIn: "5m" }
        );

        const refreshToken = sign(
            { userId: user.id },
            jwtSecret,
            { expiresIn: "7d" }
        );

        const tokenRepository = AppDataSource.getRepository(Token);

        // Save both tokens
        await tokenRepository.save(new Token(accessToken, user, false)); // access
        await tokenRepository.save(new Token(refreshToken, user, true));  // refresh

        res.status(201).send({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "internal error" });
    }
};

export const me: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).userId;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            res.status(404).send({ message: "User not found" });
            return
        }

        res.status(200).send({
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        });
        return
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
        return
    }
}

export const logout: RequestHandler = async (req, res) => {
    try {
        const userId = (req as any).userId;

        const tokenRepository = AppDataSource.getRepository(Token);
        await tokenRepository.delete({ user: { id: userId } });

        res.status(200).send({ message: "Successfully logged out" });
        return
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
        return
    }
}


export const refreshToken: RequestHandler = async (req, res) => {
    try {
        const { token: refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).send({ message: "Missing refresh token" });
            return;
        }

        const tokenRepository = AppDataSource.getRepository(Token);
        const tokenEntry = await tokenRepository.findOne({
            where: { token: refreshToken, isRefresh: true },
            relations: ["user"]
        });

        if (!tokenEntry) {
            res.status(401).send({ message: "Invalid refresh token" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET!;
        let payload: any;

        try {
            payload = verify(refreshToken, jwtSecret);
        } catch (err) {
            console.error("❌ Failed to verify refresh token:", err);
            res.status(401).send({ message: "Expired or invalid refresh token" });
            return;
        }

        // Génère un nouveau access token
        const newAccessToken = sign(
            { userId: payload.userId, email: payload.email },
            jwtSecret,
            { expiresIn: "5m" }
        );

        // Sauvegarde le nouveau access token
        await tokenRepository.save(new Token(newAccessToken, tokenEntry.user, false));

        res.status(200).send({ access_token: newAccessToken });
    } catch (error) {
        console.error("❌ Internal error in refreshToken:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

    
    