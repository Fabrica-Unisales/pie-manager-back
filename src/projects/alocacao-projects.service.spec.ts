import { Test, TestingModule } from "@nestjs/testing";
import { AlocacaoService } from "./alocacao-projects.service";
import { getModelToken } from "@nestjs/sequelize";
import { Project } from "./entities/project.entity";

describe('AlocacaoService', () => {
  let service: AlocacaoService;
  let mockProjectModel: any;

  beforeEach(async () => {
    mockProjectModel = {
        findAll: jest.fn(),
    };

    const modul: TestingModule = await Test.createTestingModule({
        providers: [
            AlocacaoService, {provide: getModelToken(Project), useValue: mockProjectModel,},
        ],
    }).compile();

    service = modul.get<AlocacaoService>(AlocacaoService);

  });

  it('Estar definido', () =>{
    expect(service).toBeDefined();
  });

  it('Alocar por: curso turno e baia', async () =>{
    const projetos = [
        {id:1, nome:'PetLove', nomeCurso:'Engenharia de Software', turno:null, baia:null, save: jest.fn()},
        {id:2, nome:'Ensalamento', nomeCurso:'Engenharia de Software', turno:null, baia:null, save: jest.fn()},
        {id:3, nome:'Vi um dog', nomeCurso:'Sistemas de Informação', turno:null, baia:null, save: jest.fn()},
        {id:4, nome:'Neurphys', nomeCurso:'Sistemas de Informação', turno:null, baia:null, save: jest.fn()},
    ];

    mockProjectModel.findAll.mockResolvedValue(projetos);
    const resultado = await service.apresentacoes();
    expect(resultado).toEqual({ message: 'Alocação concluída' });
    
    const resultadoAlocacao = projetos.map(p => ({
        id: p.id, 
        nome: p.nome,
        curso: p.nomeCurso, 
        turno: p.turno, 
        baia: p.baia
    }));

    console.table(resultadoAlocacao);

    expect(resultadoAlocacao).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                turno: expect.any(String),
                baia: expect.any(Number),
            })
        ])
    );

  });
});