import { ApiProperty } from '@nestjs/swagger';

export class ContratoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cliente: string | null;

  @ApiProperty()
  valorProposta: number;

  @ApiProperty()
  comissaoCalculada: number;

  @ApiProperty()
  operadora: string | null;

  @ApiProperty()
  linkCard: string | null;

  @ApiProperty()
  nomeExecutivo: string | null;

  @ApiProperty()
  nomeTime: string | null;

  @ApiProperty()
  dataContrato: Date | null;

  @ApiProperty()
  contratoValido: boolean;
}
