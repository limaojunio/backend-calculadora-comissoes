import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioLogin } from '../entities/usuariologin.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
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

    /**
     * JWT CARREGA AUTORIZAÇÃO
     */
    const payload = {
      sub: usuario.id,
      usuario: usuario.usuario,
      role: usuario.role,
      vendedorId: usuario.vendedorId,
    };

    return {
      id: usuario.id,
      nome: usuario.nome,
      usuario: usuario.usuario,
      foto: usuario.foto,
      role: usuario.role,
      vendedorId: usuario.vendedorId,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
