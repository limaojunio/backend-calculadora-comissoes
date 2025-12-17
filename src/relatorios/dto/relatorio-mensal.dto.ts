import { ApiProperty } from '@nestjs/swagger';

export class RelatorioMensalDto {
  @ApiProperty()
  mes: number;

  @ApiProperty()
  ano: number;

  @ApiProperty()
  totalVendido: number;

  @ApiProperty()
  totalComissao: number;

  @ApiProperty()
  quantidadeContratos: number;
}
