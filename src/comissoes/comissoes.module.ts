import { Module } from '@nestjs/common';
import { ComissoesService } from './comissoes.service';
import { ComissoesController } from './comissoes.controller';

@Module({
  providers: [ComissoesService],
  controllers: [ComissoesController],
  exports: [ComissoesService],
})
export class ComissoesModule {}
