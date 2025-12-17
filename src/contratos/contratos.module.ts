import { Module } from '@nestjs/common';
import { ComissoesModule } from '../comissoes/comissoes.module';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosLegacyRepository } from './infra/contratos-legacy.repository';

@Module({
  imports: [ComissoesModule],
  controllers: [ContratosController],
  providers: [ContratosService, ContratosLegacyRepository],
  exports: [ContratosService],
})
export class ContratosModule {}
