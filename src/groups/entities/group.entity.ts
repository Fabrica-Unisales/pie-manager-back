import { Table, Model, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Turma } from '../../turma/entities/turma.entity';
import { UserGroup } from './user-group.entity';

@Table({ tableName: 'groups' })
export class Group extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Turma)
  @Column
  turmaId: number;

  @BelongsTo(() => Turma)
  turma: Turma;

  @Column
  tema: string;

  @Column({ allowNull: true })
  descricao: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => UserGroup)
  userGroups: UserGroup[];
}