import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { request, Request } from 'express';
import { Session, SessionDocument } from './schemas/session/session';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {
    super({
      // old version
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Nouvelle version: extraire le token depuis le cookie "refresh_token"
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
            return request?.cookies?.refresh_token; // lire depuis le cookie
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET', 'changeme_refresh_secret'),
      passReqToCallback: true, // Pour accéder au token brut dans validate()
    });
  }

  async validate(req: Request, payload: any) {
    // Extraire le refresh token brut depuis le cookie
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Verifier que le payload contient jti
    if (!payload.jti) {
        throw new UnauthorizedException('Invalid token payload (missing jti)');
    }

    // Rechercher la session correspondante dans la base de données
    const session = await this.sessionModel.findOne({ jti: payload.jti }).exec();
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // Verifier que la session n'est pas révoquée
    if (session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }

    // Verifier que la session n'est pas expirée
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    // Comparer le refresh token brut avec le hash stocké dans la session
    const isTokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verifier si le token a ete remplacé (detection de token reuse)
    if (session.replacedBy) {
        // ### Token deja utilise pour refresh -> suspicion de vol
        // On revoque TOUTES les sessions associees a cet utilisateur
        await this.sessionModel.updateMany(
            { userId: session.userId, revokedAt: null },
            { $set: { revokedAt: new Date() } }
        ).exec();

        throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
    }

    // Tout est OK - retourner les infos de l'utilisateur + session
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      sessionId: session._id,
    };
  }
}