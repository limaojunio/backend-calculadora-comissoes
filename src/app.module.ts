import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ContratosModule } from './contratos/contratos.module';
import { ProdService } from './data/services/prod.service';
import { HealthModule } from './health/health.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { AnaliseDetalhada } from './contratos/entities/analise-detalhada.entity';
import { ExecutivoTime } from './contratos/entities/executivo-time.entity';
import { Times } from './contratos/entities/times.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // 🔹 CONEXÃO DEFAULT (sistema de autenticação / usuários - MySQL)
    TypeOrmModule.forRootAsync({
      name: 'default',
      useClass: ProdService,
      imports: [ConfigModule],
    }),

    // 🔹 CONEXÃO BITRIX (contratos - PostgreSQL)
    TypeOrmModule.forRootAsync({
      name: 'bitrix',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('BITRIX_DB_HOST') || process.env.BITRIX_DB_HOST,
        port: Number(configService.get('BITRIX_DB_PORT') || process.env.BITRIX_DB_PORT || 5432),
        username: configService.get('BITRIX_DB_USER') || process.env.BITRIX_DB_USER,
        password: configService.get('BITRIX_DB_PASS') || process.env.BITRIX_DB_PASS,
        database: 'bitrix',
        schema: 'sistema_comissao_vendedor',
        synchronize: false,
        logging: false,
        entities: [AnaliseDetalhada, ExecutivoTime, Times],
      }),
    }),

    AuthModule,
    UsuarioModule,
    ContratosModule,
    HealthModule,
    RelatoriosModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
