import { Column, Table, Model } from 'sequelize-typescript';

@Table({ tableName: 'modules' })
export class ModuleModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  idModule: number;
  @Column({ allowNull: false })
  name: string;
  @Column({ allowNull: true })
  description: string;
  @Column({ allowNull: false, unique: true })
  codigo: string;
  @Column
  isActive: boolean;

  subModules: ModuleModel[];
}
