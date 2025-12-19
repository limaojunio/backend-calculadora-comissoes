import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { NivelExecutivo } from '../../usuario/entities/usuario.entity';

export class SimulacaoDto {
  @ApiProperty({
    description: 'Valor do contrato em reais',
    example: 5000,
    minimum: 500,
  })
  @IsNumber()
  @Min(500)
  valorContrato: number;

  @ApiProperty({
    description: 'Taxa de conversão em percentual (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxaConversao: number;

  @ApiProperty({
    description: 'Bônus Bradesco aplicado',
    example: false,
    default: false,
  })
  @IsBoolean()
  bonusBradesco: boolean = false;

  @ApiProperty({
    description: 'Bônus Meta aplicado',
    example: false,
    default: false,
  })
  @IsBoolean()
  bonusMeta: boolean = false;

  @ApiProperty({
    description: 'Bônus Performance aplicado',
    example: false,
    default: false,
  })
  @IsBoolean()
  bonusPerformance: boolean = false;

  @ApiProperty({
    description: 'Bônus Time aplicado',
    example: false,
    default: false,
  })
  @IsBoolean()
  bonusTime: boolean = false;

  @ApiProperty({
    description: 'Bônus Meta Geral aplicado (apenas PLENO e SENIOR)',
    example: false,
    default: false,
  })
  @IsBoolean()
  bonusMetaGeral: boolean = false;

  @ApiProperty({
    description: 'Nível executivo para simulação (opcional, apenas para ADMIN). Se não fornecido, usa o nível do usuário autenticado. VENDEDOR sempre usa seu próprio nível, ignorando este campo.',
    enum: NivelExecutivo,
    required: false,
    example: NivelExecutivo.PLENO,
  })
  @IsOptional()
  @IsEnum(NivelExecutivo, {
    message: 'nivelExecutivoSimulacao deve ser JUNIOR, PLENO ou SENIOR',
  })
  nivelExecutivoSimulacao?: NivelExecutivo;
}
