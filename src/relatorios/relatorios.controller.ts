import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(
    private readonly relatoriosService: RelatoriosService,
  ) {}

  @Get('mensal')
  async mensal(
    @Query('mes') mes: number,
    @Query('ano') ano: number,
    @Req() req,
  ) {
    return this.relatoriosService.gerarRelatorioMensal(
      mes,
      ano,
      req.user,
    );
  }
}
