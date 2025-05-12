import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { Session } from "./session";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.tickets)
    user: User;

    @ManyToOne(() => Session, session => session.tickets)
    session: Session;

    @Column({ default: false })
    isUsed: boolean;

    @Column({ default: false })
    isSuperTicket: boolean;

    @Column({ default: 1 })
    remainingUses: number;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(user: User, session: Session, isSuperTicket = false) {
        this.user = user;
        this.session = session;
        this.isSuperTicket = isSuperTicket;
        this.isUsed = false;
        this.remainingUses = isSuperTicket ? 10 : 1;
    }
}
