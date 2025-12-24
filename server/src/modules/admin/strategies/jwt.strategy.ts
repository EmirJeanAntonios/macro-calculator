import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'macro-calculator-secret-key'),
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const admin = await this.adminRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException();
    }

    return { id: admin.id, username: admin.username };
  }
}

