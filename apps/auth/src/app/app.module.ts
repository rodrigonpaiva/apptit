import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { InternalController } from '../presentation/internal/me.controller';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '../better-auth/auth';

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [HealthController, InternalController],
  providers: [AppService],
})
export class AppModule {}
