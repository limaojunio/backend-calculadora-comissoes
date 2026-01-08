import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExecutivoTime } from './executivo-time.entity';

@Entity({ name: 'times', schema: 'sistema_comissao_vendedor' })
export class Times {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @ApiProperty()
  nome: string;

  @OneToMany(() => ExecutivoTime, (executivoTime) => executivoTime.time)
  executivosTime: ExecutivoTime[];
}

