import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RelatoriosService } from './relatorios.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Relatorios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('mensal')
  async mensal(
    @Query('mes') mes: number,
    @Query('ano') ano: number,
    @Req() req,
  ) {
    return this.relatoriosService.gerarRelatorioMensal(
      Number(mes),
      Number(ano),
      req.user,
    );
  }
}
