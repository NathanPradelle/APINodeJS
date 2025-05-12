import { Application, Request, Response } from "express"
import {
    createUser,
    login,
    me,
    logout,
    refreshToken
} from "./auth"
import { authMiddleware } from "../middleware/auth"

export const initHandlers = (app: Application) => {
    app.get("/health", (_: Request, res: Response) => {
        res.send({ "message": "ping" })
    })

    app.post("/auth/signup", createUser)
    app.post("/auth/login", login)
    app.post("/auth/refresh", refreshToken)
    app.get("/auth/me", authMiddleware, me)
    app.post("/auth/logout", authMiddleware, logout)
}
