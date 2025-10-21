import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Utilisateur as UtilisateurSchemaClass, UtilisateurSchema } from '../utilisateurs/schemas/utilisateur/utilisateur';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: UtilisateurSchemaClass.name, schema: UtilisateurSchema }]),

    // ✅ registerAsync() garantit que ConfigService charge les variables 
    // d'environnement AVANT la configuration du JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        // ✅ Utilise ConfigService pour lire depuis .env (pas process.env directement)
        secret: config.get('JWT_SECRET', 'changeme_dev_secret'),
        signOptions: { 
          expiresIn: config.get('JWT_EXPIRES_IN', '1h')
        },
      }),
      inject: [ConfigService], // ✅ Injecte ConfigService dans useFactory
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}