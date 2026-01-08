import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnaliseDetalhada } from './entities/analise-detalhada.entity';
import { ExecutivoTime } from './entities/executivo-time.entity';
import { Times } from './entities/times.entity';
import { ComissoesService } from '../comissoes/comissoes.service';
import { Role, NivelExecutivo } from '../usuario/entities/usuario.entity';
import { SimulacaoDto } from '../comissoes/dto/simulacao.dto';
import { ContratoDto } from './dto/contrato.dto';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(AnaliseDetalhada, 'bitrix')
    private readonly analiseDetalhadaRepository: Repository<AnaliseDetalhada>,
    private readonly comissaoService: ComissoesService,
  ) {}

  async listarContratos(usuario: any): Promise<ContratoDto[]> {
    // Validar que o usuário tem nivelExecutivo no token JWT
    if (!usuario.nivelExecutivo) {
      throw new BadRequestException(
        'Nível executivo não encontrado no token JWT. Faça login novamente.',
      );
    }

    const nivelExecutivo = usuario.nivelExecutivo as NivelExecutivo;

    // Construir query com TypeORM QueryBuilder
    const queryBuilder = this.analiseDetalhadaRepository
      .createQueryBuilder('analise')
      .leftJoin(
        ExecutivoTime,
        'executivoTime',
        'executivoTime.nomeExecutivo = analise.nomeExecutivo',
      )
      .leftJoin(Times, 'times', 'times.id = executivoTime.timeId')
      .select([
        'analise.id',
        'analise.nomeCard',
        'analise.valorProposta',
        'analise.operadora',
        'analise.linkCard',
        'analise.nomeExecutivo',
      ])
      .addSelect('analise.createdAt', 'analise_createdAt')
      .addSelect('times.nome', 'nomeTime');

    // 🔐 AUTORIZAÇÃO POR REGRA DE NEGÓCIO
    if (usuario.role === Role.VENDEDOR) {
      if (!usuario.nomeExecutivo) {
        throw new BadRequestException(
          'Nome executivo não encontrado no token JWT. Faça login novamente.',
        );
      }
      queryBuilder.where('analise.nomeExecutivo = :nomeExecutivo', {
        nomeExecutivo: usuario.nomeExecutivo,
      });
    }
    // ADMIN vê todos os contratos (sem filtro WHERE)

    const resultados = await queryBuilder.getRawMany();

    // Mapear resultados e calcular comissões
    const contratosMapeados = resultados.map((row) => {
      try {
        // 🔧 CORREÇÃO: TypeORM retorna campos com snake_case (analise_valor_proposta)
        // não camelCase (analise_valorProposta)
        
        // Garantir que valorProposta seja sempre um número válido
        const valorPropostaRaw = row.analise_valor_proposta || row.analise_valorProposta;
        let valorProposta = 0;
        
        if (valorPropostaRaw != null) {
          const valorNumerico = Number(valorPropostaRaw);
          valorProposta = isNaN(valorNumerico) ? 0 : valorNumerico;
        }

        // Verificar se o contrato é válido para cálculo de comissão
        const contratoValido = valorProposta >= 500 && !isNaN(valorProposta);

        let comissaoCalculada = 0;

        // Apenas calcular comissão se o valor for válido (>= 500)
        if (contratoValido) {
          try {
            // Para listagem de contratos, usar valores padrão:
            // - Taxa de conversão = meta do nível (100% de equivalência)
            // - Sem bônus (apenas comissão base + bônus fixo da faixa)
            const metasConversao: Record<NivelExecutivo, number> = {
              [NivelExecutivo.JUNIOR]: 30,
              [NivelExecutivo.PLENO]: 60,
              [NivelExecutivo.SENIOR]: 70,
            };

            const simulacao: SimulacaoDto = {
              valorContrato: valorProposta,
              taxaConversao: metasConversao[nivelExecutivo], // Meta atingida = 100% de equivalência
              bonusBradesco: false,
              bonusMeta: false,
              bonusPerformance: false,
              bonusTime: false,
              bonusMetaGeral: false,
            };

            const comissao = this.comissaoService.calcularComissao(
              simulacao,
              nivelExecutivo,
            );

            comissaoCalculada = comissao.comissaoFinal || 0;
          } catch (error) {
            // Se houver erro no cálculo, manter comissão como 0
            console.error('Erro ao calcular comissão:', error);
            comissaoCalculada = 0;
          }
        }

        // 🔧 CORREÇÃO: Usar nomes corretos dos campos (snake_case)
        // Garantir que cliente seja sempre string (não null/undefined)
        const cliente = (row.analise_nome_card || row.analise_nomeCard || '') ? String(row.analise_nome_card || row.analise_nomeCard || '') : '';

        // Garantir que dataContrato seja Date válida ou null
        let dataContrato: Date | null = null;
        const createdAtRaw = row.analise_createdAt || row.analise_created_at;
        if (createdAtRaw) {
          const data = new Date(createdAtRaw);
          dataContrato = isNaN(data.getTime()) ? null : data;
        }

        return {
          id: row.analise_id || 0,
          cliente: cliente, // Sempre string, nunca null
          valorProposta: valorProposta, // Sempre número válido
          comissaoCalculada: comissaoCalculada,
          operadora: (row.analise_operadora || '') ? String(row.analise_operadora) : '',
          linkCard: (row.analise_link_item_bb_code || row.analise_linkCard || '') ? String(row.analise_link_item_bb_code || row.analise_linkCard || '') : '',
          nomeExecutivo: (row.analise_nome_executivo || row.analise_nomeExecutivo || '') ? String(row.analise_nome_executivo || row.analise_nomeExecutivo) : '',
          nomeTime: row.nomeTime ? String(row.nomeTime) : '',
          dataContrato: dataContrato,
          contratoValido: contratoValido,
        };
      } catch (error) {
        // Log do erro e retornar objeto mínimo para não quebrar a resposta
        console.error('Erro ao processar contrato:', error, row);
        return {
          id: row.analise_id || 0,
          cliente: '',
          valorProposta: 0,
          comissaoCalculada: 0,
          operadora: '',
          linkCard: '',
          nomeExecutivo: '',
          nomeTime: '',
          dataContrato: null,
          contratoValido: false,
        };
      }
    });

    return contratosMapeados;
  }
}
