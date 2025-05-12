import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Session } from "./session";

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name: string;

    @Column({ type: "text" })
    description: string;

    @Column("text", { array: true })
    images: string[];

    @Column()
    type: string;

    @Column({ type: "int" })
    capacity: number;

    @Column({ default: false })
    isAccessible: boolean;

    @Column({ default: false })
    isInMaintenance: boolean;

    @OneToMany(() => Session, session => session.room)
    sessions!: Session[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor(
        name: string,
        description: string,
        images: string[],
        type: string,
        capacity: number,
        isAccessible = false,
        isInMaintenance = false
    ) {
        this.name = name;
        this.description = description;
        this.images = images;
        this.type = type;
        this.capacity = capacity;
        this.isAccessible = isAccessible;
        this.isInMaintenance = isInMaintenance;
    }
    
}