import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ComissoesService } from './comissoes.service';
import { SimulacaoDto } from './dto/simulacao.dto';
import { ComissaoCalculadaDto } from './dto/comissao.dto';
import { NivelExecutivo } from '../usuario/entities/usuario.entity';

@ApiTags('Comissões')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comissoes')
export class ComissoesController {
  constructor(private readonly service: ComissoesService) {}

  @Post('simular')
  @ApiOperation({
    summary: 'Simula o cálculo de comissão',
    description:
      'Calcula a comissão baseada no valor do contrato, taxa de conversão e bônus aplicados. O nível executivo é obtido automaticamente do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo da comissão realizado com sucesso',
    type: ComissaoCalculadaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou bônus não permitido para o nível',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  simular(
    @Body() dto: SimulacaoDto,
    @GetUser('nivelExecutivo') nivelExecutivo: NivelExecutivo,
  ): ComissaoCalculadaDto {
    if (!nivelExecutivo) {
      throw new Error('Nível executivo não encontrado no token JWT');
    }

    return this.service.calcularComissao(dto, nivelExecutivo);
  }
}
