import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Project, Turno } from "./entities/project.entity";

@Injectable()
export class AlocacaoService{
    constructor(
        @InjectModel(Project)
        private projectModel: typeof Project,
    ){}

    async apresentacoes(){
        const projetos = await this.projectModel.findAll({order:[]});

        const totalProjetos = projetos.length;
        const projetosTurno = Math.ceil(totalProjetos/3);
        const baias = projetosTurno;

        const turnos = [Turno.Turno1, Turno.Turno2, Turno.Turno3];

        turnos.forEach((turno, indexTurno) =>{
            const inicio = indexTurno * projetosTurno;
            const fim = inicio + projetosTurno;

            const prjTurno = projetos.slice(inicio, fim);

            prjTurno.forEach((projeto, indexBaia) =>{
                projeto.turno = turno;
                projeto.baia = (indexBaia % baias)+1;
                projeto.save();
            })
        })
        return {message: 'Alocação concluída'}
    }

}

