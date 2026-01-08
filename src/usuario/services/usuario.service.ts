import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';
import { Role, Usuario } from '../entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private bcrypt: Bcrypt,
  ) {}

  async findByUsuario(usuario: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { usuario },
    });
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      select: ['id', 'nome', 'usuario', 'foto', 'role', 'vendedorId'],
    });
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    return usuario;
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario) {
      throw new HttpException('O usuário já existe!', HttpStatus.BAD_REQUEST);
    }

    const senhaOriginal = usuario.senha;
    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);
    
    // 🔍 LOG TEMPORÁRIO PARA DEBUG
    console.log('========================================');
    console.log('🔐 DEBUG - CRIAÇÃO DE USUÁRIO');
    console.log('========================================');
    console.log('Email/Usuário:', usuario.usuario);
    console.log('Senha original (primeiros 3 chars):', senhaOriginal.substring(0, 3) + '***');
    console.log('Senha hashada:', usuario.senha);
    console.log('Tamanho do hash:', usuario.senha.length);
    console.log('Hash começa com:', usuario.senha.substring(0, 10));
    console.log('========================================');

    // Segurança: garante papel padrão
    if (!usuario.role) {
      usuario.role = Role.VENDEDOR;
    }

    const usuarioSalvo = await this.usuarioRepository.save(usuario);
    
    // 🔍 LOG TEMPORÁRIO - Verificar o que foi salvo
    const usuarioVerificado = await this.findById(usuarioSalvo.id);
    console.log('========================================');
    console.log('🔍 VERIFICAÇÃO PÓS-SALVAMENTO');
    console.log('========================================');
    console.log('ID do usuário salvo:', usuarioVerificado.id);
    console.log('Senha no banco (tamanho):', usuarioVerificado.senha?.length || 0);
    console.log('Senha no banco (início):', usuarioVerificado.senha?.substring(0, 10) || 'NULL');
    console.log('Hash original (início):', usuario.senha.substring(0, 10));
    console.log('Hashes coincidem?', usuarioVerificado.senha?.substring(0, 10) === usuario.senha.substring(0, 10));
    console.log('========================================');

    return usuarioSalvo;
  }

  async update(usuario: Usuario): Promise<Usuario> {
    await this.findById(usuario.id);

    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario && buscaUsuario.id !== usuario.id) {
      throw new HttpException(
        'Usuário (e-mail) já cadastrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);

    return this.usuarioRepository.save(usuario);
  }
}
