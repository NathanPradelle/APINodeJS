import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text" })
    token: string;

    @ManyToOne(() => User, user => user.tokens)
    user: User;

    @Column({ default: false })
    isRefresh: boolean;

    constructor(token: string, user: User, isRefresh = false) {
        this.token = token;
        this.user = user;
        this.isRefresh = isRefresh;
    }
}