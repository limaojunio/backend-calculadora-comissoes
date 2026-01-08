import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'analise_detalhada', schema: 'sistema_comissao_vendedor' })
export class AnaliseDetalhada {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'nome_card', type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  nomeCard: string | null;

  @Column({ name: 'valor_proposta', type: 'decimal', precision: 10, scale: 2, nullable: true })
  @ApiProperty()
  valorProposta: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  operadora: string | null;

  @Column({ name: 'link_item_bb_code', type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  linkCard: string | null;

  @Column({ name: 'nome_executivo', type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  nomeExecutivo: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  @ApiProperty()
  createdAt: Date | null;
}

