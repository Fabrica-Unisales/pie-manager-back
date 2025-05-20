import { Table, Model, Column, HasMany } from 'sequelize-typescript';
import { UserGroup } from '../../groups/entities/user-group.entity';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column
  password: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => UserGroup)
  userGroups: UserGroup[];
}
