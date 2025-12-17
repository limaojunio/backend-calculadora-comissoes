import { ApiProperty } from '@nestjs/swagger';

export class ContratoDto {
  @ApiProperty()
  idCard: number;

  @ApiProperty()
  nomeCard: string;

  @ApiProperty()
  corretorNome: string;

  @ApiProperty()
  valor: number;

  @ApiProperty()
  valorComissao: number;

  @ApiProperty()
  dataImplantacao: Date;

  @ApiProperty()
  statusAtual: string;
}
