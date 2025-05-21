import { Table, Model, Column, ForeignKey } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

@Table({ tableName: 'user_groups', timestamps: false })
export class UserGroup extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Group)
  @Column
  groupId: number;
}