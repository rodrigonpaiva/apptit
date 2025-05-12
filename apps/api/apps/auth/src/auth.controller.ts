import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(data: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      data.email,
      data.password,
    );
    if (!user) throw new Error('Invalid credentials');
    return this.authService.login(user);
  }
}
