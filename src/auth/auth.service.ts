import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UtilisateurDocument, Utilisateur as UtilisateurSchemaClass } from '../utilisateurs/schemas/utilisateur/utilisateur';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectModel(UtilisateurSchemaClass.name) private utilisateurModel: Model<UtilisateurDocument>,
    private readonly jwtService: JwtService,
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
    return createdUser.save();
  }

  async validateUser(email: string, password: string) {
    const user = await this.utilisateurModel.findOne({ email }).exec();
    if(!user) return null;

    const passwordValid = await bcrypt.compare(password, (user as any).password || '');
    if(!passwordValid) return null;

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    
    return {
      access_token: accessToken,
    };
  }
}
