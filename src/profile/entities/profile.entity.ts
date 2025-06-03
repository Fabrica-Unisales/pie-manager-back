import { Table, Model, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { ProfilePermission } from './profile-permission.entity';

export enum TipoPerfil {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PROFESSOR = 'PROFESSOR',
  ALUNO = 'ALUNO',
  COORDENADOR = 'COORDENADOR',
  SECRETARIO = 'SECRETARIO'
}

@Table({ 
  tableName: 'perfis',
  timestamps: true,
  paranoid: true
})
export class Profile extends Model {
  @Column({ 
    primaryKey: true, 
    autoIncrement: true,
    type: DataType.INTEGER
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  })
  nome: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  descricao: string;

  @Column({
    type: DataType.ENUM(...Object.values(TipoPerfil)),
    allowNull: false,
    defaultValue: TipoPerfil.ALUNO
  })
  tipo: TipoPerfil;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  ativo: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  })
  nivelAcesso: number;

  @HasMany(() => User)
  usuarios: User[];

  @BelongsToMany(() => Permission, () => ProfilePermission)
  permissoes: Permission[];
}
