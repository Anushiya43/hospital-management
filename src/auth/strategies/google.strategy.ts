import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0].value;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Get role from state if user doesn't exist (passed from the initial request)
    const roleFromState = req.query.state;

    return {
      email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      providerId: profile.id,
      role: user?.role || roleFromState,
    };
  }
}
