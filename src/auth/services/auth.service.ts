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

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    if (!matchPassword) {
      throw new HttpException('Senha inválida!', HttpStatus.UNAUTHORIZED);
    }

    const { senha, ...usuarioSemSenha } = buscaUsuario;
    return usuarioSemSenha;
  }

  async login(usuarioLogin: UsuarioLogin) {
    const usuario = await this.usuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    if (!usuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    // Buscar usuario_executivo ativo
    const usuarioExecutivo = await this.usuarioExecutivoRepository.findOne({
      where: {
        usuarioId: usuario.id,
        ativo: true,
      },
    });

    const nomeExecutivo = usuarioExecutivo?.nomeExecutivo || null;

    // Regra de negócio: VENDEDOR deve ter nomeExecutivo
    if (usuario.role === Role.VENDEDOR && !nomeExecutivo) {
      throw new BadRequestException(
        'Usuário vendedor deve estar vinculado a um executivo ativo no Bitrix.',
      );
    }

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
