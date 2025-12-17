import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ContratosModule } from './contratos/contratos.module';
import { ProdService } from './data/services/prod.service';
import { HealthModule } from './health/health.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // 🔹 CONEXÃO PRINCIPAL (sistema de autenticação / usuários)
    TypeOrmModule.forRootAsync({
      name: 'default',
      useClass: ProdService,
      imports: [ConfigModule],
    }),

    // 🔹 CONEXÃO LEGADA (READ ONLY – sistema da empresa)
    TypeOrmModule.forRootAsync({
      name: 'legacy',
      imports: [ConfigModule],
      inject: [],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.LEGACY_DB_HOST,
        port: Number(process.env.LEGACY_DB_PORT),
        username: process.env.LEGACY_DB_USER,
        password: process.env.LEGACY_DB_PASS,
        database: process.env.LEGACY_DB_NAME,
        synchronize: false,
        entities: [],
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
