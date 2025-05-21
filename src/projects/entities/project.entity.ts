import { Model } from "sequelize";
import { AllowNull, AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";
import { CreateProjectDto } from "../dto/create-project.dto";

@Table({tableName: 'projects'})
export class Project extends Model<Project, CreateProjectDto>{

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
