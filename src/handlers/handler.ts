import { Application, Request, Response } from "express"
import {
    createUser,
    login,
    me,
    logout,
    refreshToken
} from "./auth"

import {
    listMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie
  } from "./movie"

import {
listRooms,
getRoom,
createRoom,
updateRoom,
deleteRoom
} from "./room"

import {
listSessions,
getSession,
createSession,
updateSession,
deleteSession
} from "./session"

import {
listTickets,
buyTicket,
useTicket
} from "./ticket"

import {
listTransactions,
createTransaction
} from "./transaction"

import {
globalFrequencyStats,
roomFrequencyStats,
periodFrequencyStats
} from "./stats"  
import { authMiddleware } from "../middleware/auth"
import { requireAdminRole } from "../middleware/requireAdminRole";
import { listUsers, getUserDetails } from "./user";

export const initHandlers = (app: Application) => {
    app.get("/health", (_: Request, res: Response) => {
        res.send({ "message": "ping" })
    })

    app.post("/auth/signup", createUser)
    app.post("/auth/login", login)
    app.post("/auth/refresh", refreshToken)
    app.get("/auth/me", authMiddleware, me)
    app.post("/auth/logout", authMiddleware, logout)

    app.get("/movies", listMovies);
    app.get("/movies/:id", getMovie);
    app.post("/movies", authMiddleware, requireAdminRole, createMovie);    
    app.put("/movies/:id", authMiddleware, requireAdminRole,  updateMovie); 
    app.delete("/movies/:id", authMiddleware, requireAdminRole, deleteMovie); 

    app.get("/rooms", listRooms);
    app.get("/rooms/:id", getRoom);
    app.post("/rooms", authMiddleware, requireAdminRole, createRoom);
    app.put("/rooms/:id", authMiddleware, requireAdminRole, updateRoom);
    app.delete("/rooms/:id", authMiddleware, requireAdminRole, deleteRoom);

    // Sessions
    app.get("/sessions", listSessions);
    app.get("/sessions/:id", getSession);
    app.post("/sessions", authMiddleware, requireAdminRole, createSession);
    app.put("/sessions/:id", authMiddleware, requireAdminRole, updateSession);
    app.delete("/sessions/:id", authMiddleware, requireAdminRole, deleteSession);

    // Tickets
    app.get("/tickets", authMiddleware, listTickets);
    app.post("/tickets", authMiddleware, buyTicket);
    app.post("/tickets/:id/use", authMiddleware, useTicket);

    // Transactions
    app.get("/transactions", authMiddleware, listTransactions);
    app.post("/transactions", authMiddleware, createTransaction);

    // Stats
    app.get("/stats/frequency", globalFrequencyStats);
    app.get("/stats/frequency/room/:id", roomFrequencyStats);
    app.get("/stats/frequency/period", periodFrequencyStats);

    app.get("/users", authMiddleware, requireAdminRole, listUsers);
    app.get("/users/:id", authMiddleware, requireAdminRole, getUserDetails);
}
