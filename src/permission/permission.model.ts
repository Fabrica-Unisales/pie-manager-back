import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class PermissionModel extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  idPermission: number;
  @Column
  idModule: number;
  @Column({ unique: true })
  codigo: string;
  @Column
  name: string;
  @Column
  description: string;
}