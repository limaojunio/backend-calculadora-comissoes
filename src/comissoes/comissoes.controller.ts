import { Body, Controller, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ComissoesService } from './comissoes.service';
import { SimulacaoDto } from './dto/simulacao.dto';
import { ComissaoCalculadaDto } from './dto/comissao.dto';
import { NivelExecutivo, Role } from '../usuario/entities/usuario.entity';

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
      'Calcula a comissão baseada no valor do contrato, taxa de conversão e bônus aplicados. ' +
      'O nível executivo é obtido automaticamente do usuário autenticado. ' +
      'ADMINs podem opcionalmente fornecer nivelExecutivoSimulacao para simular com outro nível. ' +
      'VENDEDORs sempre usam seu próprio nível, ignorando nivelExecutivoSimulacao se fornecido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo da comissão realizado com sucesso',
    type: ComissaoCalculadaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, nível executivo inválido ou bônus não permitido para o nível',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  simular(
    @Body() dto: SimulacaoDto,
    @GetUser('nivelExecutivo') nivelExecutivo: NivelExecutivo,
    @GetUser('role') role: Role,
  ): ComissaoCalculadaDto {
    if (!nivelExecutivo) {
      throw new BadRequestException('Nível executivo não encontrado no token JWT');
    }

    // Determinar qual nível executivo usar para o cálculo
    let nivelParaCalculo: NivelExecutivo;

    if (role === Role.ADMIN && dto.nivelExecutivoSimulacao) {
      // ADMIN pode simular com nível diferente
      // Validar que o nível fornecido é válido
      if (
        !Object.values(NivelExecutivo).includes(dto.nivelExecutivoSimulacao)
      ) {
        throw new BadRequestException(
          `Nível executivo de simulação inválido: ${dto.nivelExecutivoSimulacao}. Deve ser JUNIOR, PLENO ou SENIOR.`,
        );
      }
      nivelParaCalculo = dto.nivelExecutivoSimulacao;
    } else {
      // VENDEDOR sempre usa seu próprio nível
      // ADMIN sem nivelExecutivoSimulacao também usa seu próprio nível
      nivelParaCalculo = nivelExecutivo;
    }

    return this.service.calcularComissao(dto, nivelParaCalculo);
  }
}
