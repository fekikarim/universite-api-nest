import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UtilisateurDocument, Utilisateur as UtilisateurSchemaClass } from '../utilisateurs/schemas/utilisateur/utilisateur';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Session, SessionDocument } from './schemas/session/session';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectModel(UtilisateurSchemaClass.name) private utilisateurModel: Model<UtilisateurDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateAuthDto) {
    const exitingUser = await this.utilisateurModel.findOne({ email: dto.email }).exec();
    if(exitingUser) throw new BadRequestException(`Email ${dto.email} already in use`);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const createdUser = new this.utilisateurModel({
      ...dto,
      password: hashedPassword,
    });
    await createdUser.save();

    return {
      message: 'User registered successfully',
      userId: createdUser._id,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.utilisateurModel.findOne({ email }).exec();
    if(!user) return null;

    const passwordValid = await bcrypt.compare(password, (user as any).password || '');
    if(!passwordValid) return null;

    return user;
  }

  // ****************************************
  // Login before implementing refresh tokens
  // async login(loginDto: LoginDto) {
  //   const user = await this.validateUser(loginDto.email, loginDto.password);
  //   if (!user) throw new UnauthorizedException('Invalid credentials');

  //   const payload = { sub: user._id, email: user.email, role: user.role };

  //   const accessToken = this.jwtService.sign(payload);
    
  //   return {
  //     access_token: accessToken,
  //   };
  // }
  // ****************************************

  // ###############################################
  // Login with refresh token and session management
  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Ensure we have a string userId before using it
    const userId = (user._id as any).toString();

    // Generate tokens
    const jti = uuidv4();
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(userId, jti);

    // Create session
    await this.createSession(userId, refreshToken, jti, ip, userAgent);

    // Return tokens and user info
    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Generate access token
  private generateAccessToken(user: UtilisateurDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '30s'),
    } as any);
  }

  // Generate refresh token
  private generateRefreshToken(userId: string, jti: string) {
    const payload = { sub: userId, jti };
    const refreshToken = this.jwtService.sign(payload as any, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_TTL', '7d'),
    } as any);
    return refreshToken;
  }

  // Create a new session with refresh token
  private async createSession(
    userId: string,
    refreshToken: string,
    jti: string,
    ip?: string,
    userAgent?: string,
  ) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const ttl = this.configService.get<string>('REFRESH_TOKEN_TTL', '7d');
    const expiresAt = this.calculateExpiryDate(ttl);

    const session = new this.sessionModel({
      userId,
      jti,
      refreshTokenHash,
      expiresAt,
      ip,
      userAgent,
    });
    return session.save();
  }

  // Calculate expiry date based on TTL string
  private calculateExpiryDate(ttl: string): Date {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) throw new BadRequestException('Invalid TTL format');

    const [, value, unit] = match;
    const now = new Date();
    const ms = parseInt(value) * {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }[unit as 's' | 'm' | 'h' | 'd'];

    return new Date(now.getTime() + ms);
  }

  // Rotation / refresh handler
  async refresh(payload: any, ip?: string, userAgent?: string) {
    const { userId, jti: oldJti } = payload;

    // Find the existing session
    const oldSession = await this.sessionModel.findOne({ jti: oldJti }).exec();
    if (!oldSession || oldSession.revokedAt) throw new UnauthorizedException('Invalid session or session revoked');

    // Receive user information
    const user = await this.utilisateurModel.findById(userId).exec();
    if (!user) throw new UnauthorizedException('User not found');

    // Create new jti and new refresh token
    const newJti = uuidv4();
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(userId, newJti);

    // Save new session on db (hash of the new refresh token)
    await this.createSession(userId, newRefreshToken, newJti, ip, userAgent);

    // Mark old session as replaced
    oldSession.replacedBy = newJti;
    await oldSession.save();

    // Return new tokens
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout (revoke current session)
  async logout(jti: string) {
    const session = await this.sessionModel.findOne({ jti }).exec();
    if (!session) throw new UnauthorizedException('Session not found');

    session.revokedAt = new Date();
    await session.save();

    return { message: 'Logout successful' };
  }

  // Logout from all sessions (revoke all sessions for a user)
  async logoutAllSessions(userId: string) {
    const result = await this.sessionModel.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    ).exec();

    return { 
      message: 'All sessions revoked successfully',
      count: result.modifiedCount,
    };
  }
}
