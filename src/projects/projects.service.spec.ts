import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/sequelize';
import { Project } from './entities/project.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectModel: any;


  beforeEach(async () => {
    mockProjectModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService,
      {
        provide: getModelToken(Project),
        useValue: mockProjectModel,
      },],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });



/////// LIST
  it('Listar projetos (findAll)', async () => {
    const projects = [{ id: 1}, {id: 2}];
    mockProjectModel.findAll.mockResolvedValue(projects);
    const resultado = await service.findAll();
    expect(resultado).toEqual(projects);
  });

  /////// CREATE
  it('Criar projeto (create)', async () =>{
    const createDto = {
      nome: 'PetLove',
      curso: 'Engenharia de software',
      grupo: 2,
      periodo: 3,
    };

    const expected = {id: 1,  ...createDto};
    mockProjectModel.create.mockResolvedValue(expected);

    const resultado = await service.create(createDto);
    expect(resultado).toEqual(expected);
    expect(mockProjectModel.create).toHaveBeenCalledWith(createDto);


  });

  ///////// READ
  it('Bscar por id (findByPk)', async() =>{
    const project = {id: 1, nome:'PetLove'};
    mockProjectModel.findByPk.mockResolvedValue(project);
    
    const resultado = await service.findOne(1);
    expect(resultado).toEqual(project);
  });

  /////// UPDATE
  it('Atualizar projeto (update)', async() =>{
  const updateDto = {nome: 'PetLove ATUALIZADO'};
  const project = {id: 1, nome: 'PetLove', update: jest.fn().mockResolvedValue([1])};

  mockProjectModel.findByPk.mockResolvedValue(project);
  mockProjectModel.update.mockResolvedValue([1]);
  mockProjectModel.findByPk.mockResolvedValue({id: 1, ...updateDto});

  const resultado = await service.update(1, updateDto);
  expect(mockProjectModel.update).toHaveBeenCalledWith(updateDto, {where: {id: 1}});
  expect(resultado).toEqual({id: 1, nome: 'PetLove ATUALIZADO'});
  });

  /////// DELETE
  it('Deletar projeto (destroy)', async() =>{
    const destroyMock = jest.fn();
    const project = {id:1, destroy: destroyMock,};
    mockProjectModel.findByPk.mockResolvedValue(project);

    await service.remove(1);
    expect(destroyMock).toHaveBeenCalled();
  }); 
});

