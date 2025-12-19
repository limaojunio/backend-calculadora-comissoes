import { NivelExecutivo } from '../../usuario/entities/usuario.entity';

/**
 * Configuração centralizada dos percentuais de bônus por nível executivo
 * 
 * Todos os percentuais são calculados sobre a BASE da comissão.
 * 
 * Regras:
 * - JUNIOR: Não possui Meta Geral (valor 0)
 * - PLENO e SENIOR: Possuem todos os bônus
 */
export interface BonusPorNivel {
  /** Percentual do bônus Bradesco sobre a BASE */
  bradesco: number;
  /** Percentual do bônus Meta sobre a BASE */
  meta: number;
  /** Percentual do bônus Performance sobre a BASE */
  performance: number;
  /** Percentual do bônus Time sobre a BASE */
  time: number;
  /** Percentual do bônus Meta Geral sobre a BASE (0 se não disponível) */
  metaGeral: number;
}

/**
 * Mapa centralizado com os percentuais de bônus por nível executivo
 * 
 * Valores conforme regras oficiais:
 * 
 * JUNIOR:
 *   - Bradesco: 25%
 *   - Meta: 10%
 *   - Performance: 15%
 *   - Time: 10%
 *   - Meta Geral: NÃO possui (0%)
 * 
 * PLENO:
 *   - Bradesco: 25%
 *   - Meta: 10%
 *   - Performance: 15%
 *   - Time: 5%
 *   - Meta Geral: 5%
 * 
 * SENIOR:
 *   - Bradesco: 25%
 *   - Meta: 5%
 *   - Performance: 15%
 *   - Time: 10%
 *   - Meta Geral: 5%
 */
export const BONUS_POR_NIVEL: Record<NivelExecutivo, BonusPorNivel> = {
  [NivelExecutivo.JUNIOR]: {
    bradesco: 0.25,      // 25%
    meta: 0.1,           // 10%
    performance: 0.15,   // 15%
    time: 0.1,           // 10%
    metaGeral: 0,        // NÃO possui Meta Geral
  },
  [NivelExecutivo.PLENO]: {
    bradesco: 0.25,      // 25%
    meta: 0.1,           // 10%
    performance: 0.15,   // 15%
    time: 0.05,          // 5%
    metaGeral: 0.05,     // 5%
  },
  [NivelExecutivo.SENIOR]: {
    bradesco: 0.25,      // 25%
    meta: 0.05,          // 5%
    performance: 0.15,   // 15%
    time: 0.1,           // 10%
    metaGeral: 0.05,     // 5%
  },
};

/**
 * Retorna a configuração de bônus para um nível executivo específico
 * @param nivel Nível executivo
 * @returns Configuração de bônus para o nível
 */
export function getBonusPorNivel(nivel: NivelExecutivo): BonusPorNivel {
  const config = BONUS_POR_NIVEL[nivel];
  if (!config) {
    throw new Error(`Nível executivo inválido: ${nivel}`);
  }
  return config;
}

