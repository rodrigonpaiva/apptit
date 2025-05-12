import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser (email: string, password: string): Promise<any> {
    const user = {id: 1, email, password: await bcrypt.hash(password, 10) };
    const isPassowordValid = await bcrypt.compare(password, user.password);
    if (!isPassowordValid) return null;
    const { password: _, ...result } = user;
    return result;
  }

  async login (user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
