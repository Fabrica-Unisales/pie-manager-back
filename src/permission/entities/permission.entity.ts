import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import { Profile } from '../../profile/entities/profile.entity';
import { ProfilePermission } from '../../profile/entities/profile-permission.entity';

export enum TipoPermissao {
  LEITURA = 'LEITURA',
  ESCRITA = 'ESCRITA',
  EXCLUSAO = 'EXCLUSAO',
  ADMINISTRACAO = 'ADMINISTRACAO'
}

export enum ModuloSistema {
  USUARIOS = 'USUARIOS',
  PERFIS = 'PERFIS',
  PROJETOS = 'PROJETOS',
  TURMAS = 'TURMAS',
  CURSOS = 'CURSOS',
  GRUPOS = 'GRUPOS',
  RELATORIOS = 'RELATORIOS'
}

@Table({ 
  tableName: 'permissoes',
  timestamps: true
})
export class Permission extends Model {
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
    type: DataType.ENUM(...Object.values(TipoPermissao)),
    allowNull: false
  })
  tipo: TipoPermissao;

  @Column({
    type: DataType.ENUM(...Object.values(ModuloSistema)),
    allowNull: false
  })
  modulo: ModuloSistema;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  recurso: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  ativo: boolean;

  @BelongsToMany(() => Profile, () => ProfilePermission)
  perfis: Profile[];
}
