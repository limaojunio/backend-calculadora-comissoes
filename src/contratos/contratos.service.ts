import { Injectable } from '@nestjs/common';
import { ContratoDto } from './dto/contrato.dto';
import { ContratosLegacyRepository } from './infra/contratos-legacy.repository';
import { ComissoesService } from '../comissoes/comissoes.service';

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

  // 🔐 AUTORIZAÇÃO POR DADO
  const filtrados =
    usuario.role === 'ADMIN'
      ? contratos
      : contratos.filter(
          (c) => c.corretor_nome === usuario.nome,
        );

  return filtrados.map((c) => {
    const comissao = this.comissaoService.calcular(
      Number(c.valor),
      'PLANO_SAUDE',
    );

    return {
      idCard: c.id_card,
      nomeCard: c.nome_card,
      corretorNome: c.corretor_nome,
      valor: Number(c.valor),
      valorComissao: comissao.valorComissao,
      dataImplantacao: c.data_implantacao,
      statusAtual: c.status_atual,
    };
  });
}
}
