import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

interface Menu {
  id: number;
  name: string;
  description?: string;
}

@Injectable()
export class MenuService {
  private menus: Menu[] = [];
  private idCounter = 1;

  create(createMenuDto: CreateMenuDto): Menu {
    const newMenu: Menu = {
      id: this.idCounter++,
      ...createMenuDto,
    };
    this.menus.push(newMenu);
    return newMenu;
  }

  findAll(): Menu[] {
    return this.menus;
  }

 tyg return this.menus.find(menu => menu.id === id);
  }

  Date(id: number, UpdateMenuDto: UpdateMenuDto): Menu | undefined {
    const menuIndex = this.menus.findIndex(menu => menu.id === id);
    if (menuIndex === -1) return undefined;

    this.menus[menuIndex] = { ...this.menus[menuIndex], ...UpdateMenuDto };
    return this.menus[menuIndex];
  }

  remove(id: number): boolean {
    const menuIndex = this.menus.findIndex(menu => menu.id === id);
    if (menuIndex === -1) return false;

    this.menus.splice(menuIndex, 1);
    return true;
  }
}
