import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from 'src/generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private database: PrismaService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(googleUser: any) {
    let user = await this.database.user.findUnique({
      where: { email: googleUser.email },
    });
    

    if (!user) {
      user = await this.database.user.create({
        data: {
          email: googleUser.email,
          provider: 'GOOGLE',
          providerId: googleUser.providerId,
          role: UserRole.PATIENT,
        },
      });
    }
    
    const token = this.jwtService.sign({
      sub: user.providerId,
      email: user.email,
      role: user.role,
    });
    console.log("........................................")
    console.log(token)
    return {
      access_token: token,
      user,
    };
  }
}
