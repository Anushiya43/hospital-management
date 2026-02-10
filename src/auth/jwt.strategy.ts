import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Extract token from the current request
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }
    
    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    const isBlacklisted = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }
    console.log("//////////////////////////")
    console.log(payload)
    return {
      ...payload,
      token, // Optionally include token in the payload
    };
  }
}