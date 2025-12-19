import { Injectable, BadRequestException } from '@nestjs/common';
import { ContratoDto } from './dto/contrato.dto';
import { ContratosLegacyRepository } from './infra/contratos-legacy.repository';
import { ComissoesService } from '../comissoes/comissoes.service';
import { Role, NivelExecutivo } from '../usuario/entities/usuario.entity';
import { SimulacaoDto } from '../comissoes/dto/simulacao.dto';

@Injectable()
export class ContratosService {
  constructor(
    private readonly legacyRepo: ContratosLegacyRepository,
    private readonly comissaoService: ComissoesService,
  ) {}

  async listarContratos(usuario: any): Promise<ContratoDto[]> {
    const inicio = new Date('2025-01-01');
    const fim = new Date();

    const contratos = await this.legacyRepo.executarQuery(inicio, fim);

    // 🔐 AUTORIZAÇÃO POR REGRA DE NEGÓCIO
    const filtrados =
      usuario.role === Role.ADMIN
        ? contratos
        : contratos.filter((c) => {
            // 🔹 Regra principal (quando existir vendedorId)
            if (usuario.vendedorId) {
              return String(c.corretor_nome) === String(usuario.nome);
            }

            // 🔹 Fallback temporário (legado ainda por nome)
            return c.corretor_nome === usuario.nome;
          });

    // Validar que o usuário tem nivelExecutivo no token JWT
    if (!usuario.nivelExecutivo) {
      throw new BadRequestException(
        'Nível executivo não encontrado no token JWT. Faça login novamente.',
      );
    }

    const nivelExecutivo = usuario.nivelExecutivo as NivelExecutivo;

    return filtrados.map((c) => {
      const valorContrato = Number(c.valor);

      // Para listagem de contratos, usar valores padrão:
      // - Taxa de conversão = meta do nível (100% de equivalência)
      // - Sem bônus (apenas comissão base + bônus fixo da faixa)
      const metasConversao: Record<NivelExecutivo, number> = {
        [NivelExecutivo.JUNIOR]: 30,
        [NivelExecutivo.PLENO]: 60,
        [NivelExecutivo.SENIOR]: 70,
      };

      const simulacao: SimulacaoDto = {
        valorContrato,
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

      return {
        idCard: c.id_card,
        nomeCard: c.nome_card,
        corretorNome: c.corretor_nome,
        valor: valorContrato,
        valorComissao: comissao.comissaoFinal, // Usar comissão final (já com taxa equivalente aplicada)
        dataImplantacao: c.data_implantacao,
        statusAtual: c.status_atual,
      };
    });
  }
}
