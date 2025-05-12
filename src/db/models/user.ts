import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Ticket } from "./ticket";
import { Transaction } from "./transaction";
import { Token } from "./token"

export enum UserRole {
    CLIENT = "client",
    ADMIN = "admin"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.CLIENT })
    role: UserRole;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    balance: number;

    @OneToMany(() => Ticket, ticket => ticket.user)
    tickets!: Ticket[];

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions!: Transaction[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];

    constructor(id: number, email: string, password: string, role: UserRole = UserRole.CLIENT, createdAt: Date, updatedAt: Date) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.balance = 0;
    }
    
}