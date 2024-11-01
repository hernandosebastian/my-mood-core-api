import { Controller, Get } from '@nestjs/common';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Auth(AuthType.None)
  async healthCheck(): Promise<{ status: string; uptime: number }> {
    return { status: 'ok', uptime: process.uptime() };
  }
}
