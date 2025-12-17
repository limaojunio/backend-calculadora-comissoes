/**
 * Representa UMA LINHA retornada pela QUERY do sistema legado
 * (não é Entity, não é DTO)
 */
export type ContratoRaw = {
  id_card: number;
  nome_card: string;
  corretor_nome: string;
  valor: number;
  data_implantacao: Date;
  status_atual: string;
};
