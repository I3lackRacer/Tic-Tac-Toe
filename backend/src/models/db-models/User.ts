import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false})
  username: string;

  @Column({ nullable: false})
  password: string;

  @Column({ default: false, nullable: false})
  isAdmin: boolean;

  @Column({ default: 1000, nullable: false})
  mmr: number;

  @Column({ default: 0, nullable: false})
  losts: number;

  @Column({ default: 0, nullable: false})
  wins: number;

  @Column({ type:'blob', nullable: true })
  image: Buffer;
}