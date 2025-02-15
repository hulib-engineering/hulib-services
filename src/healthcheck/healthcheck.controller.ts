import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Healthcheck')
@Controller({
  path: 'healthcheck',
})
export class HealthcheckController {
  constructor() {}

  @Get()
  findAll() {
    return {
      status: 'ok',
    };
  }
}
