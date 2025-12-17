import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ComissoesService } from './comissoes.service';
import { SimulacaoDto } from './dto/simulacao.dto';

@ApiTags('Comissões')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comissoes')
export class ComissoesController {
  constructor(private readonly service: ComissoesService) {}

  @Post('simular')
  simular(@Body() dto: SimulacaoDto) {
    return this.service.calcular(dto.valorVenda, dto.tipoProduto);
  }
}
