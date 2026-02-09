import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    console.log({
  clientId: process.env.GOOGLE_CLIENT_ID,
  callback: process.env.GOOGLE_CALLBACK_URL,
  });
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    });
  }
  

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    return {
      email: profile.emails?.[0].value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      providerId: profile.id,
    };
  }
}
