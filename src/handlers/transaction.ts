import { RequestHandler } from "express";
import { AppDataSource } from "../db/database";
import { Transaction, TransactionType } from "../db/models/transaction";
import { User } from "../db/models/user";
import { createTransactionValidation } from "./validators/transaction/create-transaction";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Liste les transactions de l'utilisateur connecté
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des transactions
 */
export const listTransactions: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    const repo = AppDataSource.getRepository(Transaction);
    const transactions = await repo.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" }
    });
    res.status(200).send(transactions);
};

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Créer une transaction (ajout ou retrait)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *               type:
 *                 type: string
 *                 enum: [add, withdrawal]
 *     responses:
 *       201:
 *         description: Transaction effectuée
 *       400:
 *         description: Solde insuffisant ou données invalides
 */
export const createTransaction: RequestHandler = async (req, res) => {
    const validation = createTransactionValidation.validate(req.body);
    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details));
        return;
    }

    const { amount, type } = validation.value;
    const userRepo = AppDataSource.getRepository(User);
    const transactionRepo = AppDataSource.getRepository(Transaction);

    const user = await userRepo.findOneBy({ id: (req as any).userId });
    if (!user) {
        res.status(400).send({ message: "User not found" });
        return;
    }

    const transaction = transactionRepo.create({
        user,
        amount,
        type
    });

    // Update user balance
    if (type === TransactionType.DEPOSIT) {
        user.balance += amount;
    } else if (type === TransactionType.WITHDRAWAL) {
        if (user.balance < amount) {
            res.status(400).send({ message: "Insufficient balance" });
            return;
        }
        user.balance -= amount;
    }

    await transactionRepo.save(transaction);
    await userRepo.save(user);

    res.status(201).send(transaction);
};
