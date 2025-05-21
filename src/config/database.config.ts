import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage: '.db/data.sqlite3',
  autoLoadModels: true,
  synchronize: true,
};
