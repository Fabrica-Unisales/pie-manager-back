import {
  Table,
  Model,
  Column,
  HasMany,
  BelongsTo,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { UserGroup } from '../../groups/entities/user-group.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { Turma } from '../../turma/entities/turma.entity';

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

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  perfilId: number;

  @BelongsTo(() => Profile)
  perfil: Profile;

  @HasMany(() => UserGroup)
  userGroups: UserGroup[];

  @ForeignKey(() => Turma)
  @Column({ allowNull: true })
  turmaId: number;

  @BelongsTo(() => Turma)
  turma: Turma;
}
