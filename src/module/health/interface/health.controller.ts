import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  @Auth(AuthType.None)
  async healthCheck(): Promise<{ status: string; uptime: number }> {
    return { status: 'ok', uptime: process.uptime() };
  }
}
