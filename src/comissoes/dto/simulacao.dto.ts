import { ApiProperty } from '@nestjs/swagger';

export class SimulacaoDto {
  @ApiProperty()
  valorVenda: number;

  @ApiProperty({
    description: 'Ex: PLANO_SAUDE, SEGURO_VIDA, PME',
  })
  tipoProduto: string;
}
