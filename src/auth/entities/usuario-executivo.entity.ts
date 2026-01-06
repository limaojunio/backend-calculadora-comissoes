import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'usuario_executivo' })
export class UsuarioExecutivo {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'usuario_id', type: 'int', nullable: false })
  @ApiProperty()
  usuarioId: number;

  @Column({ name: 'nome_executivo', type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  nomeExecutivo: string | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  @ApiProperty()
  ativo: boolean;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

