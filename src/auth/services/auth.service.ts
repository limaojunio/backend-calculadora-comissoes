import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioLogin } from '../entities/usuariologin.entity';
import { UsuarioExecutivo } from '../entities/usuario-executivo.entity';
import { Role } from '../../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
    @InjectRepository(UsuarioExecutivo)
    private usuarioExecutivoRepository: Repository<UsuarioExecutivo>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const buscaUsuario = await this.usuarioService.findByUsuario(username);

    if (!buscaUsuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    // 🔍 LOG TEMPORÁRIO PARA DEBUG
    console.log('========================================');
    console.log('🔐 DEBUG - VALIDAÇÃO DE LOGIN');
    console.log('========================================');
    console.log('Email/Usuário:', username);
    console.log('Senha digitada (primeiros 3 chars):', password.substring(0, 3) + '***');
    console.log('Senha no banco (tamanho):', buscaUsuario.senha?.length || 0);
    console.log('Senha no banco (início):', buscaUsuario.senha?.substring(0, 10) || 'NULL');
    console.log('========================================');

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    // 🔍 LOG TEMPORÁRIO - Resultado da comparação
    console.log('========================================');
    console.log('🔍 RESULTADO DA COMPARAÇÃO');
    console.log('========================================');
    console.log('Senhas coincidem?', matchPassword);
    console.log('========================================');

    if (!matchPassword) {
      throw new HttpException('Senha inválida!', HttpStatus.UNAUTHORIZED);
    }

    const { senha, ...usuarioSemSenha } = buscaUsuario;
    return usuarioSemSenha;
  }

  async login(usuarioLogin: UsuarioLogin) {
    // 🔍 LOG TEMPORÁRIO
    console.log('========================================');
    console.log('🔐 DEBUG - MÉTODO LOGIN');
    console.log('========================================');
    console.log('Email/Usuário recebido:', usuarioLogin.usuario);
    console.log('========================================');

    const usuario = await this.usuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    if (!usuario) {
      console.log('❌ ERRO: Usuário não encontrado no método login');
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    console.log('✅ Usuário encontrado:', usuario.id, usuario.role);

    // Buscar usuario_executivo ativo
    const usuarioExecutivo = await this.usuarioExecutivoRepository.findOne({
      where: {
        usuarioId: usuario.id,
        ativo: true,
      },
    });

    const nomeExecutivo = usuarioExecutivo?.nomeExecutivo || null;

    console.log('🔍 Verificação de executivo:');
    console.log('  - Role:', usuario.role);
    console.log('  - nomeExecutivo:', nomeExecutivo);
    console.log('  - É VENDEDOR?', usuario.role === Role.VENDEDOR);
    console.log('  - Tem nomeExecutivo?', !!nomeExecutivo);

    // Regra de negócio: VENDEDOR deve ter nomeExecutivo
    if (usuario.role === Role.VENDEDOR && !nomeExecutivo) {
      console.log('❌ ERRO: VENDEDOR sem nomeExecutivo');
      throw new BadRequestException(
        'Usuário vendedor deve estar vinculado a um executivo ativo no Bitrix.',
      );
    }

    console.log('✅ Validações passaram, gerando token...');
    console.log('========================================');

    /**
     * JWT CARREGA AUTORIZAÇÃO
     */
    const payload = {
      sub: usuario.id,
      usuario: usuario.usuario,
      role: usuario.role,
      nivelExecutivo: usuario.nivelExecutivo,
      vendedorId: usuario.vendedorId,
      nomeExecutivo: nomeExecutivo,
    };

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      foto: usuario.foto,
      role: usuario.role,
      nivelExecutivo: usuario.nivelExecutivo,
      vendedorId: usuario.vendedorId,
      nomeExecutivo: nomeExecutivo,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
