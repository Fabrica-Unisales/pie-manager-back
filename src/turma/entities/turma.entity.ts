import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'turmas', timestamps: false }) 
export class Turma extends Model<Turma> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nome: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  periodo: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  curso: string;
}