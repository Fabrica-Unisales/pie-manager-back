import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Curso extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nome: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  descricao: string;
}
