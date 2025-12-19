import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de resposta com o cálculo completo da comissão
 */
export class ComissaoCalculadaDto {
  @ApiProperty({ description: 'Valor do contrato informado' })
  valorContrato: number;

  @ApiProperty({ description: 'Comissão base calculada' })
  comissaoBase: number;

  @ApiProperty({ description: 'Bônus fixo por faixa de contrato' })
  bonusFixo: number;

  @ApiProperty({ description: 'Valor do bônus Bradesco' })
  valorBonusBradesco: number;

  @ApiProperty({ description: 'Valor do bônus Meta' })
  valorBonusMeta: number;

  @ApiProperty({ description: 'Valor do bônus Performance' })
  valorBonusPerformance: number;

  @ApiProperty({ description: 'Valor do bônus Time' })
  valorBonusTime: number;

  @ApiProperty({ description: 'Valor do bônus Meta Geral' })
  valorBonusMetaGeral: number;

  @ApiProperty({ description: 'Soma de todos os valores antes da conversão' })
  comissaoTotalBruta: number;

  @ApiProperty({ 
    description: 'Taxa equivalente calculada (TaxaConversaoReal ÷ MetaNivel, limitado a 1.0)',
    example: 0.996,
  })
  multiplicadorConversao: number;

  @ApiProperty({ description: 'Comissão final após aplicar multiplicador de conversão' })
  comissaoFinal: number;

  @ApiProperty({ description: 'Percentual final da comissão sobre o contrato' })
  percentualFinal: number;

  @ApiProperty({ description: 'Categoria do contrato (A, B, C, D)' })
  categoria: string;

  @ApiProperty({ description: 'Taxa de conversão base esperada para o nível' })
  conversaoBase: number;

  @ApiProperty({ description: 'Nível executivo usado no cálculo' })
  nivelExecutivo: string;
}
