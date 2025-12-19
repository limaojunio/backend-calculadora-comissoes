import { Injectable, BadRequestException } from '@nestjs/common';
import { ComissaoCalculadaDto } from './dto/comissao.dto';
import { SimulacaoDto } from './dto/simulacao.dto';
import { NivelExecutivo } from '../usuario/entities/usuario.entity';
import { getBonusPorNivel } from './config/bonus-por-nivel.config';

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
 * 
 * Nota: Os percentuais de bônus são obtidos da configuração centralizada
 * em bonus-por-nivel.config.ts através da função getBonusPorNivel()
 */
interface NivelConfig {
  percentualBase: number; // Percentual sobre o valor do contrato (25%, 50%, 70%)
  label: string;
  metaConversao: number; // Meta de conversão esperada (30%, 60%, 70%)
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
   * Configuração de níveis executivos conforme regras oficiais TRADS
   * 
   * Os percentuais de bônus são obtidos da configuração centralizada em bonus-por-nivel.config.ts
   */
  private readonly niveisConfig: Record<NivelExecutivo, NivelConfig> = {
    [NivelExecutivo.JUNIOR]: {
      percentualBase: 0.25, // 25% sobre o valor do contrato
      label: 'Júnior',
      metaConversao: 30, // Meta de conversão: 30%
    },
    [NivelExecutivo.PLENO]: {
      percentualBase: 0.5, // 50% sobre o valor do contrato
      label: 'Pleno',
      metaConversao: 60, // Meta de conversão: 60%
    },
    [NivelExecutivo.SENIOR]: {
      percentualBase: 0.7, // 70% sobre o valor do contrato
      label: 'Sênior',
      metaConversao: 70, // Meta de conversão: 70%
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

    // Validação: Bônus Meta Geral é ignorado para JUNIOR (não lança erro, apenas não aplica)

    const config = this.niveisConfig[nivelExecutivo];
    
    // 1. Encontrar a faixa do contrato para definir categoria e bônus fixo
    const faixa = this.faixasContratos.find(
      (f) =>
        simulacao.valorContrato >= f.min &&
        simulacao.valorContrato <= f.max,
    );

    if (!faixa) {
      throw new BadRequestException(
        `Valor do contrato (R$ ${simulacao.valorContrato}) fora das faixas permitidas (mínimo: R$ 500)`,
      );
    }

    // 2. Calcular a BASE DA COMISSÃO
    // BaseComissao = ValorContrato × PercentualNivel
    const comissaoBase = simulacao.valorContrato * config.percentualBase;

    // 3. Obter BÔNUS FIXO da faixa (depende da faixa e do nível)
    let bonusFixo = 0;
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

    // 4. Calcular BÔNUS PERCENTUAIS (sempre sobre a BASE)
    // Usar configuração centralizada para garantir consistência
    const bonusConfig = getBonusPorNivel(nivelExecutivo);
    
    const valorBonusBradesco = simulacao.bonusBradesco
      ? comissaoBase * bonusConfig.bradesco
      : 0;

    const valorBonusMeta = simulacao.bonusMeta
      ? comissaoBase * bonusConfig.meta
      : 0;

    const valorBonusPerformance = simulacao.bonusPerformance
      ? comissaoBase * bonusConfig.performance
      : 0;

    const valorBonusTime = simulacao.bonusTime
      ? comissaoBase * bonusConfig.time
      : 0;

    // Meta Geral: se o bônus não está disponível para o nível (metaGeral = 0), não aplicar mesmo que solicitado
    const valorBonusMetaGeral =
      simulacao.bonusMetaGeral && bonusConfig.metaGeral > 0
        ? comissaoBase * bonusConfig.metaGeral
        : 0;

    // 5. Calcular COMISSÃO BRUTA
    // ComissaoBruta = BaseComissao + SomaBonusPercentuais + BonusFixoDaFaixa
    const comissaoTotalBruta =
      comissaoBase +
      valorBonusBradesco +
      valorBonusMeta +
      valorBonusPerformance +
      valorBonusTime +
      valorBonusMetaGeral +
      bonusFixo;

    // 6. Calcular TAXA EQUIVALENTE
    // TaxaEquivalente = TaxaConversaoReal ÷ MetaNivel (limitado a 1.0)
    const taxaEquivalente = Math.min(
      simulacao.taxaConversao / config.metaConversao,
      1.0,
    );

    // 7. Calcular COMISSÃO FINAL
    // ComissaoFinal = ComissaoBruta × TaxaEquivalente
    const comissaoFinal = comissaoTotalBruta * taxaEquivalente;

    // 8. Calcular PERCENTUAL FINAL
    const percentualFinal = (comissaoFinal / simulacao.valorContrato) * 100;

    // 9. ARREDONDAMENTO: Todos os cálculos em ponto flutuante,
    // arredondar apenas no valor final retornado (2 casas decimais)
    return {
      valorContrato: Number(simulacao.valorContrato.toFixed(2)),
      comissaoBase: Number(comissaoBase.toFixed(2)),
      bonusFixo: Number(bonusFixo.toFixed(2)),
      valorBonusBradesco: Number(valorBonusBradesco.toFixed(2)),
      valorBonusMeta: Number(valorBonusMeta.toFixed(2)),
      valorBonusPerformance: Number(valorBonusPerformance.toFixed(2)),
      valorBonusTime: Number(valorBonusTime.toFixed(2)),
      valorBonusMetaGeral: Number(valorBonusMetaGeral.toFixed(2)),
      comissaoTotalBruta: Number(comissaoTotalBruta.toFixed(2)),
      multiplicadorConversao: Number(taxaEquivalente.toFixed(4)),
      comissaoFinal: Number(comissaoFinal.toFixed(2)),
      percentualFinal: Number(percentualFinal.toFixed(2)),
      categoria: faixa.categoria,
      conversaoBase: config.metaConversao,
      nivelExecutivo: nivelExecutivo,
    };
  }

}
