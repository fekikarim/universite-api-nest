import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { Utilisateur as UtilisateurSchemaClass, UtilisateurSchema } from './schemas/utilisateur/utilisateur';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UtilisateurSchemaClass.name, schema: UtilisateurSchema }]),
    AuthModule
  ],
  controllers: [AdminController],
  providers: [UtilisateursService],
  exports: [UtilisateursService],
})
export class AdminModule {}
