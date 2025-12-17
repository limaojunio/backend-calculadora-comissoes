import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * DTO de Login (mantido para Auth)
 */
export class UsuarioLogin {
  @ApiProperty()
  public usuario: string;

  @ApiProperty()
  public senha: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
}

@Entity({ name: 'tb_usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  nome: string;

  @IsEmail()
  @Column({ length: 255, nullable: false, unique: true })
  @ApiProperty({ example: 'email@email.com.br' })
  usuario: string;

  @IsNotEmpty()
  @MinLength(8)
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  senha: string;

  @Column({ length: 5000, nullable: true })
  @ApiProperty()
  foto: string;

  /**
   * Papel do usuário no sistema
   */
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VENDEDOR,
  })
  @ApiProperty({ enum: Role })
  role: Role;

  /**
   * ID do vendedor no sistema legado
   * (NÃO é FK, apenas referência)
   */
  @Column({
    name: 'vendedor_id',
    type: 'int',
    nullable: true,
  })
  @ApiProperty({
    description: 'ID do vendedor no sistema legado',
    required: false,
  })
  vendedorId: number | null;
}
