import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter o usuário autenticado da requisição
 * Usa-se assim: @GetUser() user ou @GetUser('nivelExecutivo') nivelExecutivo
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

