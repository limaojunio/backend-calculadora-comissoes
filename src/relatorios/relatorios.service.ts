import { Injectable, ForbiddenException } from '@nestjs/common';
import { ContratosService } from '../contratos/contratos.service';
import { Role } from '../usuario/entities/usuario.entity';

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly contratosService: ContratosService,
  ) {}

  async gerarRelatorioMensal(
    mes: number,
    ano: number,
    usuario: any,
  ) {
    const contratos = await this.contratosService.listarContratos(usuario);

    const filtrados = contratos.filter((c) => {
      const data = new Date(c.dataImplantacao);
      return (
        data.getMonth() + 1 === mes &&
        data.getFullYear() === ano
      );
    });

    const totalVendido = filtrados.reduce(
      (acc, c) => acc + Number(c.valor),
      0,
    );

    const totalComissao = filtrados.reduce(
      (acc, c) => acc + Number(c.valorComissao),
      0,
    );

    if (usuario.role === Role.VENDEDOR) {
      return {
        mes,
        ano,
        vendedor: usuario.nome,
        quantidadeContratos: filtrados.length,
        totalVendido,
        totalComissao,
      };
    }

    if (usuario.role === Role.ADMIN) {
      return {
        mes,
        ano,
        quantidadeContratos: filtrados.length,
        totalVendidoGeral: totalVendido,
        totalComissaoGeral: totalComissao,
      };
    }

    throw new ForbiddenException('Perfil não autorizado');
  }
}
