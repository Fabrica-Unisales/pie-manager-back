import { Table, Model, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { Profile } from './profile.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Table({ 
  tableName: 'perfil_permissoes',
  timestamps: true
})
export class ProfilePermission extends Model {
  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  perfilId: number;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  permissaoId: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  ativo: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  dataConcessao: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  dataExpiracao: Date;
} 