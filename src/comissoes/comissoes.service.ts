import { Injectable } from '@nestjs/common';
import { ComissaoDto } from './dto/comissao.dto';

@Injectable()
export class ComissoesService {

  calcular(valorVenda: number, tipoProduto: string): ComissaoDto {
    const percentual = this.obterPercentual(tipoProduto);
    const valorComissao = Number(
      (valorVenda * percentual).toFixed(2),
    );

    return {
      valorVenda,
      percentual,
      valorComissao,
    };
  }

  /**
   * MODELO DE COMISSÃO TRADS
   * (substituir conforme planilha oficial)
   */
  private obterPercentual(tipoProduto: string): number {
    switch (tipoProduto) {
      case 'PLANO_SAUDE':
        return 0.05; // 5%
      case 'SEGURO_VIDA':
        return 0.08; // 8%
      case 'PME':
        return 0.06; // 6%
      default:
        return 0.04; // padrão
    }
  }
}
