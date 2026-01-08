import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComissoesModule } from '../comissoes/comissoes.module';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { AnaliseDetalhada } from './entities/analise-detalhada.entity';
import { ExecutivoTime } from './entities/executivo-time.entity';
import { Times } from './entities/times.entity';
import { UsuarioExecutivo } from '../auth/entities/usuario-executivo.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [AnaliseDetalhada, ExecutivoTime, Times],
      'bitrix',
    ),
    TypeOrmModule.forFeature(
      [UsuarioExecutivo, Usuario],
      'default',
    ),
    ComissoesModule,
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
