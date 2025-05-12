import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Session } from "./session";

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title: string;

    @Column({ type: "text" })
    synopsis: string;

    @Column()
    duration: number; // in minutes

    @Column("text", { array: true })
    genres: string[];

    @OneToMany(() => Session, session => session.movie)
    sessions!: Session[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor(
        title: string,
        synopsis: string,
        duration: number,
        genres: string[]
    ) {
        this.title = title;
        this.synopsis = synopsis;
        this.duration = duration;
        this.genres = genres;
    }
}