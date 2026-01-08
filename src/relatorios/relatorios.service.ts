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
      if (!c.dataContrato) {
        return false;
      }
      const data = new Date(c.dataContrato);
      return (
        data.getMonth() + 1 === mes &&
        data.getFullYear() === ano
      );
    });

    // Filtrar apenas contratos válidos para cálculos de totais
    const contratosValidos = filtrados.filter((c) => c.contratoValido === true);

    const totalVendido = contratosValidos.reduce(
      (acc, c) => acc + Number(c.valorProposta),
      0,
    );

    const totalComissao = contratosValidos.reduce(
      (acc, c) => acc + Number(c.comissaoCalculada),
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
