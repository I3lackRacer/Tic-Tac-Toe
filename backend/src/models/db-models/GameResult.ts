import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class GameResult {


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    player1: number;

    @Column()
    player1mmr: number;

    @Column()
    player2: number;

    @Column()
    player2mmr: number;

    @Column({
        type: String
    })
    result: string;

}