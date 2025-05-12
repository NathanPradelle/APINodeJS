import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Room } from "./room";
import { Movie } from "./movie";
import { Ticket } from "./ticket";

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Room, room => room.sessions)
    room: Room;

    @ManyToOne(() => Movie, movie => movie.sessions)
    movie: Movie;

    @Column({ type: "timestamp" })
    startTime: Date;

    @Column({ type: "timestamp" })
    endTime: Date;

    @OneToMany(() => Ticket, ticket => ticket.session)
    tickets!: Ticket[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor(movie: Movie, room: Room, startTime: Date, endTime: Date) {
        this.movie = movie;
        this.room = room;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}