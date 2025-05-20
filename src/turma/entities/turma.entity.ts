import { Table, Model, Column, HasMany } from 'sequelize-typescript';
import { Group } from '../../groups/entities/group.entity';

@Table({ tableName: 'turmas' })
export class Turma extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ allowNull: false })
  nome: string;

  @Column({ allowNull: false })
  curso: string;

  @Column({ unique: true })
  codigo: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Group)
  groups: Group[];
}