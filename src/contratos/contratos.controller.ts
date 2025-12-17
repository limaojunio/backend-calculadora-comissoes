import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ContratosService } from './contratos.service';

@ApiTags('Contratos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

@Get()
async listar(@Req() req) {
  return this.contratosService.listarContratos(req.user);
}

}
