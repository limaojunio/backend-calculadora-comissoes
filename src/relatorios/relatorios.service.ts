import { Injectable } from '@nestjs/common';
import { ContratosService } from '../contratos/contratos.service';
import { RelatorioMensalDto } from './dto/relatorio-mensal.dto';

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly contratosService: ContratosService,
  ) {}

  /**
   * Cache em memória:
   * chave = role-vendedorId-mes-ano
   */
  private cache = new Map<string, RelatorioMensalDto>();

  async gerarRelatorioMensal(
    mes: number,
    ano: number,
    usuario: any,
  ): Promise<RelatorioMensalDto> {

    const chaveCache = `${usuario.role}-${usuario.vendedorId}-${mes}-${ano}`;

    // 🔹 Retorna do cache se existir
    const cacheExistente = this.cache.get(chaveCache);
    if (cacheExistente) {
      return cacheExistente;
    }

    const contratos = await this.contratosService.listarContratos(usuario);

    // 🔹 filtra por mês/ano
    const filtrados = contratos.filter((c) => {
      const data = new Date(c.dataImplantacao);
      return (
        data.getMonth() + 1 === Number(mes) &&
        data.getFullYear() === Number(ano)
      );
    });

    const totalVendido = filtrados.reduce(
      (acc, c) => acc + c.valor,
      0,
    );

    const totalComissao = filtrados.reduce(
      (acc, c) => acc + c.valorComissao,
      0,
    );

    const relatorio: RelatorioMensalDto = {
      mes,
      ano,
      totalVendido,
      totalComissao,
      quantidadeContratos: filtrados.length,
    };

    // 🔹 Salva no cache
    this.cache.set(chaveCache, relatorio);

    return relatorio;
  }
}
