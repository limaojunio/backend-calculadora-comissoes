import { Injectable, BadRequestException } from '@nestjs/common';
import { ComissaoCalculadaDto } from './dto/comissao.dto';
import { SimulacaoDto } from './dto/simulacao.dto';
import { NivelExecutivo } from '../usuario/entities/usuario.entity';

/**
 * Interface para configuração de faixas de contrato
 */
interface FaixaContrato {
  categoria: string;
  min: number;
  max: number;
  bonusJunior: number;
  bonusPleno: number;
  bonusSenior: number;
}

/**
 * Interface para configuração de níveis executivos
 */
interface NivelConfig {
  taxa: number;
  label: string;
  bonusBradescoPerc: number;
  bonusMetaPerc: number;
  bonusPerformancePerc: number;
  bonusTimePerc: number;
  bonusMetaGeralPerc: number;
  conversaoBase: number;
  multiplicador: number;
}

@Injectable()
export class ComissoesService {
  /**
   * Faixas de contratos com bônus fixos por nível
   */
  private readonly faixasContratos: FaixaContrato[] = [
    { categoria: 'A – Baixos', min: 500, max: 1500, bonusJunior: 0, bonusPleno: 0, bonusSenior: 0 },
    { categoria: 'A – Baixos', min: 1500, max: 2900, bonusJunior: 0, bonusPleno: 0, bonusSenior: 0 },
    { categoria: 'B – Médios', min: 2901, max: 4000, bonusJunior: 500, bonusPleno: 500, bonusSenior: 500 },
    { categoria: 'B – Médios', min: 4001, max: 5000, bonusJunior: 700, bonusPleno: 700, bonusSenior: 700 },
    { categoria: 'B – Médios', min: 5001, max: 6000, bonusJunior: 800, bonusPleno: 1150, bonusSenior: 1000 },
    { categoria: 'B – Médios', min: 6001, max: 7000, bonusJunior: 1200, bonusPleno: 1200, bonusSenior: 1200 },
    { categoria: 'C – Altos', min: 7001, max: 8000, bonusJunior: 1400, bonusPleno: 1400, bonusSenior: 1400 },
    { categoria: 'C – Altos', min: 8001, max: 9000, bonusJunior: 1600, bonusPleno: 1600, bonusSenior: 1600 },
    { categoria: 'C – Altos', min: 9001, max: 10000, bonusJunior: 1800, bonusPleno: 1800, bonusSenior: 1800 },
    { categoria: 'D – Premium', min: 10001, max: 11000, bonusJunior: 2000, bonusPleno: 2000, bonusSenior: 2000 },
    { categoria: 'D – Premium', min: 11001, max: 12000, bonusJunior: 2300, bonusPleno: 2300, bonusSenior: 2300 },
    { categoria: 'D – Premium', min: 12001, max: 13000, bonusJunior: 2400, bonusPleno: 2400, bonusSenior: 2500 },
    { categoria: 'D – Premium', min: 13001, max: 999999, bonusJunior: 2900, bonusPleno: 2900, bonusSenior: 3000 },
  ];

  /**
   * Configuração de níveis executivos
   */
  private readonly niveisConfig: Record<NivelExecutivo, NivelConfig> = {
    [NivelExecutivo.JUNIOR]: {
      taxa: 0.25,
      label: 'Júnior',
      bonusBradescoPerc: 0.25,
      bonusMetaPerc: 0.1,
      bonusPerformancePerc: 0.15,
      bonusTimePerc: 0.1,
      bonusMetaGeralPerc: 0,
      conversaoBase: 30,
      multiplicador: 3.3333,
    },
    [NivelExecutivo.PLENO]: {
      taxa: 0.5,
      label: 'Pleno',
      bonusBradescoPerc: 0.25,
      bonusMetaPerc: 0.1,
      bonusPerformancePerc: 0.15,
      bonusTimePerc: 0.05,
      bonusMetaGeralPerc: 0.05,
      conversaoBase: 60,
      multiplicador: 1.66,
    },
    [NivelExecutivo.SENIOR]: {
      taxa: 0.7,
      label: 'Sênior',
      bonusBradescoPerc: 0.25,
      bonusMetaPerc: 0.05,
      bonusPerformancePerc: 0.15,
      bonusTimePerc: 0.1,
      bonusMetaGeralPerc: 0.05,
      conversaoBase: 70,
      multiplicador: 1.43,
    },
  };

  /**
   * Calcula a comissão completa baseada nos parâmetros fornecidos
   * @param simulacao DTO com os dados da simulação
   * @param nivelExecutivo Nível executivo do usuário autenticado
   * @returns DTO com todos os cálculos detalhados
   */
  calcularComissao(
    simulacao: SimulacaoDto,
    nivelExecutivo: NivelExecutivo,
  ): ComissaoCalculadaDto {
    // Validação do nível executivo
    if (!this.niveisConfig[nivelExecutivo]) {
      throw new BadRequestException(
        `Nível executivo inválido: ${nivelExecutivo}`,
      );
    }

    // Validação: Bônus Meta Geral só para PLENO e SENIOR
    if (
      simulacao.bonusMetaGeral &&
      nivelExecutivo === NivelExecutivo.JUNIOR
    ) {
      throw new BadRequestException(
        'Bônus Meta Geral não disponível para nível Júnior',
      );
    }

    const config = this.niveisConfig[nivelExecutivo];
    const faixa = this.faixasContratos.find(
      (f) =>
        simulacao.valorContrato >= f.min &&
        simulacao.valorContrato <= f.max,
    );

    // Cálculo da comissão base
    const comissaoBase = simulacao.valorContrato * config.taxa;

    // Bônus fixo por faixa
    let bonusFixo = 0;
    if (faixa) {
      switch (nivelExecutivo) {
        case NivelExecutivo.JUNIOR:
          bonusFixo = faixa.bonusJunior;
          break;
        case NivelExecutivo.PLENO:
          bonusFixo = faixa.bonusPleno;
          break;
        case NivelExecutivo.SENIOR:
          bonusFixo = faixa.bonusSenior;
          break;
      }
    }

    // Cálculo dos bônus percentuais
    const valorBonusBradesco = simulacao.bonusBradesco
      ? comissaoBase * config.bonusBradescoPerc
      : 0;

    const valorBonusMeta = simulacao.bonusMeta
      ? comissaoBase * config.bonusMetaPerc
      : 0;

    const valorBonusPerformance = simulacao.bonusPerformance
      ? comissaoBase * config.bonusPerformancePerc
      : 0;

    const valorBonusTime = simulacao.bonusTime
      ? comissaoBase * config.bonusTimePerc
      : 0;

    const valorBonusMetaGeral =
      simulacao.bonusMetaGeral && nivelExecutivo !== NivelExecutivo.JUNIOR
        ? comissaoBase * config.bonusMetaGeralPerc
        : 0;

    // Comissão total bruta (antes da conversão)
    const comissaoTotalBruta =
      comissaoBase +
      bonusFixo +
      valorBonusBradesco +
      valorBonusMeta +
      valorBonusPerformance +
      valorBonusTime +
      valorBonusMetaGeral;

    // Cálculo do multiplicador de conversão
    const txConversaoDecimal = simulacao.taxaConversao / 100;
    const multiplicadorConversao = Math.min(
      txConversaoDecimal * config.multiplicador,
      1.0,
    );

    // Comissão final após aplicar multiplicador
    const comissaoFinal = comissaoTotalBruta * multiplicadorConversao;

    // Percentual final sobre o contrato
    const percentualFinal = (comissaoFinal / simulacao.valorContrato) * 100;

    return {
      valorContrato: simulacao.valorContrato,
      comissaoBase: Number(comissaoBase.toFixed(2)),
      bonusFixo: Number(bonusFixo.toFixed(2)),
      valorBonusBradesco: Number(valorBonusBradesco.toFixed(2)),
      valorBonusMeta: Number(valorBonusMeta.toFixed(2)),
      valorBonusPerformance: Number(valorBonusPerformance.toFixed(2)),
      valorBonusTime: Number(valorBonusTime.toFixed(2)),
      valorBonusMetaGeral: Number(valorBonusMetaGeral.toFixed(2)),
      comissaoTotalBruta: Number(comissaoTotalBruta.toFixed(2)),
      multiplicadorConversao: Number(multiplicadorConversao.toFixed(4)),
      comissaoFinal: Number(comissaoFinal.toFixed(2)),
      percentualFinal: Number(percentualFinal.toFixed(2)),
      categoria: faixa?.categoria || 'N/A',
      conversaoBase: config.conversaoBase,
      nivelExecutivo: nivelExecutivo,
    };
  }

  /**
   * Método legado mantido para compatibilidade
   * @deprecated Use calcularComissao() ao invés deste método
   */
  calcular(valorVenda: number, tipoProduto: string) {
    const percentual = this.obterPercentual(tipoProduto);
    const valorComissao = Number((valorVenda * percentual).toFixed(2));

    return {
      valorVenda,
      percentual,
      valorComissao,
    };
  }

  /**
   * MODELO DE COMISSÃO TRADS
   * (substituir conforme planilha oficial)
   * @deprecated Este método será removido quando o novo modelo estiver completo
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
