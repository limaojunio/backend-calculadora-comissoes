import { ApiProperty } from '@nestjs/swagger';

export class ComissaoDto {
  @ApiProperty()
  valorVenda: number;

  @ApiProperty()
  percentual: number;

  @ApiProperty()
  valorComissao: number;
}
