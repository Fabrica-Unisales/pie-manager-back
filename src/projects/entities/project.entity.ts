import {
    AllowNull,
    AutoIncrement,
    Column,
    PrimaryKey,
    Table, Model,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { Curso } from '../../cursos/entities/curso.entity';
import { Group } from '../../groups/entities/group.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { User } from '../../users/entities/user.entity';

export enum Turno {
    Turno1 = 'Turno 1',
    Turno2 = 'Turno 2',
    Turno3 = 'Turno 3'

}

@Table({ tableName: 'projects' })
export class Project extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @AllowNull(false)
    @Column
    nome: string;

    @ForeignKey(() => Curso)
    @Column
    nomeCurso: number;

    @ForeignKey(() => Group)
    @Column
    grupoId: number;

    @ForeignKey(() => Turma)
    @Column
    turmaId: number;

    @ForeignKey(() => User)
    @Column
    usuarioId: number;

    @ForeignKey(() => Turma)
    @Column
    periodo: string;

    @Column
    turno: Turno;

    @Column
    baia: number;

    @BelongsTo(() => Curso)
    curso: Curso;

    @BelongsTo(() => Group)
    group: Group;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Turma)
    turma: Turma;
}
