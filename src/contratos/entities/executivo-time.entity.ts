import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Times } from './times.entity';

@Entity({ name: 'executivo_time', schema: 'sistema_comissao_vendedor' })
export class ExecutivoTime {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'nome_executivo', type: 'varchar', length: 255, nullable: false })
  @ApiProperty()
  nomeExecutivo: string;

  @Column({ name: 'time_id', type: 'int', nullable: false })
  @ApiProperty()
  timeId: number;

  @ManyToOne(() => Times)
  @JoinColumn({ name: 'time_id' })
  time: Times;
}

