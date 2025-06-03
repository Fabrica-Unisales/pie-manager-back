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

        const turnos = [Turno.Turno1, Turno.Turno2, Turno.Turno3];

        const projetoDoCurso = projetos.reduce((acc, projeto) => {
        const nomeCurso = projeto.nomeCurso;
            if (!acc[nomeCurso]) {
                acc[nomeCurso] = [];
            }
            acc[nomeCurso].push(projeto);
            return acc;
        }, 
        {} as Record<string, Project[]>);

        let estande = 1;

        Object.values(projetoDoCurso).forEach((projetosCurso) =>{
            const totalProjetos = projetosCurso.length;
            const projetosTurno = Math.ceil(totalProjetos/ turnos.length);

            turnos.forEach((turno, indexTurno) =>{
            const inicio = indexTurno * projetosTurno;
            const fim = inicio + projetosTurno;

            const prjTurno = projetosCurso.slice(inicio, fim);

            prjTurno.forEach((projeto) =>{
                projeto.turno = turno;
                projeto.baia = estande;
                projeto.save();
            });

            });
            estande++;
        });

        
        return {message: 'Alocação concluída'}
    }

}

