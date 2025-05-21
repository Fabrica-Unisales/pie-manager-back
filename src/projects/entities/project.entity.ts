import {
    AllowNull,
    AutoIncrement,
    Column,
    PrimaryKey,
    Table, Model
} from 'sequelize-typescript';

@Table({ tableName: 'projects' })
export class Project extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @AllowNull(false)
    @Column
    nome: string;

    @AllowNull(false)
    @Column
    curso: string;

    @AllowNull(false)
    @Column
    grupo: number;

    @AllowNull(false)
    @Column
    periodo: number;
}
