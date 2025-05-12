import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user";

export enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    TICKET_PURCHASE = "ticket_purchase"
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.transactions)
    user: User;

    @Column({ type: "enum", enum: TransactionType })
    type: TransactionType;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount: number;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(user: User, type: TransactionType, amount: number) {
        this.user = user;
        this.type = type;
        this.amount = amount;
    }
}