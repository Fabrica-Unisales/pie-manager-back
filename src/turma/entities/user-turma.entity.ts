import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Turma } from './turma.entity';

@Table({ tableName: 'user_turmas', timestamps: false })
export class UserTurma extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Turma)
  @Column
  turmaId: number;

  @BelongsTo(() => User)
    user: User;
  
    @BelongsTo(() => Turma)
    group: Turma;
}