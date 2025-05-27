import { Controller, Post } from "@nestjs/common";
import { AlocacaoService } from "./alocacao-projects.service";

@Controller('Alocacao')
export class AlocacaoController {
    constructor(private readonly alocacaoService: AlocacaoService){}

    @Post('executar')
    executarAlocacao(){
        return this.alocacaoService.apresentacoes();
    }
}