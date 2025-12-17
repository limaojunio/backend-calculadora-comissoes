import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ContratoRaw } from '../types/contrato-raw.type';

@Injectable()
export class ContratosLegacyRepository {
  constructor(
    @InjectDataSource('legacy')
    private readonly dataSource: DataSource,
  ) {}

  async executarQuery(
    dataInicio: Date,
    dataFim: Date,
  ): Promise<ContratoRaw[]> {
    return this.dataSource.query(
      `
WITH
-- CTE 1.1: Mapa de Nomes (user_id -> Nome Completo)
usuarios AS (
    SELECT user_id::TEXT AS id, CONCAT(name,' ',last_name) AS nome_completo
    FROM timeline.users_data
),

-- CTE 1.2: Mapa de Nomes (id_lista -> Nome Completo)
mapa_html_novo_campo (id, nome_completo) AS (
    VALUES
    ('154','Alicia Freitas'),('156','Pedro Gomes'),('160','Enoque Veras'),
    ('2464','Amadeu Rodrigues'),('2468','Juarez de Farias'),('2470','Ronald Fereira'),
    ('2472','Oton Goes'),('2474','Davi Lima'),('2476','Thie Luan'),
    ('3408','Jhonny Frutuoso'),('2480','Djalma Neto'),('2482','Marcelo Soares'),
    ('2484','Gabriel Ury'),('2486','Erik Yan'),('2508','Guilherne Vidal'),
    ('3070','João Marcus'),('3324','Entony Souza'),('3334','Rammon Japa'),
    ('3336','Inativo'),('30830','Arthur Sena Programador'),
    ('30892','Administrativo'),('30896','Isael Leonardo')
),

-- CTE 1.3: Mapa Mestre de Corretores
mapa_campo_antigo AS (
    SELECT d.id_deal, u.nome_completo, 1 AS prioridade
    FROM timeline.deals_data d
    JOIN usuarios u ON d.valor = u.id
    WHERE d.campo = 'UF_CRM_1736605579'
    GROUP BY d.id_deal, u.nome_completo
),

mapa_campo_novo AS (
    SELECT d.id_deal, m.nome_completo, 2 AS prioridade
    FROM timeline.deals_data d
    JOIN mapa_html_novo_campo m ON d.valor = m.id
    WHERE d.campo = 'UF_CRM_1715956330'
    GROUP BY d.id_deal, m.nome_completo
),

mapa_corretores_unificado AS (
    SELECT id_deal, nome_completo, prioridade,
           ROW_NUMBER() OVER (PARTITION BY id_deal ORDER BY prioridade) AS rn
    FROM (
        SELECT * FROM mapa_campo_antigo
        UNION ALL
        SELECT * FROM mapa_campo_novo
    ) t
),

mapa_agrupado AS (
    SELECT id_deal, nome_completo AS corretor_nome
    FROM mapa_corretores_unificado
    WHERE rn = 1
),

normaliza_nomes AS (
    SELECT
        id_deal,
        CASE
            WHEN corretor_nome ILIKE '%Ronald%Fereira%'
              OR corretor_nome ILIKE '%Ronald%Ferreira%'
            THEN 'Ronald Ferreira'
            ELSE corretor_nome
        END AS corretor_nome
    FROM mapa_agrupado
),

-- EVENTOS DE IMPLANTAÇÃO
eventos_implantacao_total AS (
    SELECT *
    FROM (
        SELECT
            t.id_card,
            t.data_hora AS data_implantacao,
            ROW_NUMBER() OVER(PARTITION BY t.id_card ORDER BY t.data_hora DESC) rn
        FROM timeline."Timeline" t
        WHERE t.pipeline_novo = 'Implantação'
          AND t.data_hora BETWEEN $1::timestamp AND $2::timestamp
    ) sub
    WHERE rn = 1
),

deals_info AS (
    SELECT
        id_deal,
        MAX(CASE WHEN campo = 'TITLE' THEN valor END) AS nome_card,
        COALESCE(
          NULLIF(REPLACE(MAX(CASE WHEN campo = 'OPPORTUNITY' THEN valor END), ',', '.'), ''),
          '0'
        )::numeric(10,2) AS valor
    FROM timeline.deals_data
    GROUP BY id_deal
)

SELECT
    e.id_card,
    di.nome_card,
    COALESCE(nn.corretor_nome, 'Corretor Não Atribuído') AS corretor_nome,
    di.valor,
    e.data_implantacao,
    'Positivo' AS status_atual
FROM eventos_implantacao_total e
JOIN deals_info di ON di.id_deal = e.id_card
LEFT JOIN normaliza_nomes nn ON nn.id_deal = e.id_card
ORDER BY e.data_implantacao DESC
      `,
      [dataInicio, dataFim],
    );
  }
}
