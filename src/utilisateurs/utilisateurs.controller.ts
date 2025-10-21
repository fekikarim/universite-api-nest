import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UtilisateursService } from './utilisateurs.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './schemas/utilisateur/utilisateur';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  // 🔒 Seuls les ADMIN peuvent créer des utilisateurs
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    return this.utilisateursService.create(createUtilisateurDto);
  }

  // ✅ Accessible à tous les utilisateurs authentifiés (ADMIN + ETUDIANT)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.utilisateursService.findAll();
  }

  // ✅ Accessible à tous les utilisateurs authentifiés
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.utilisateursService.findOne(id);
  }

  // 🔒 Seuls les ADMIN peuvent mettre à jour
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUtilisateurDto: UpdateUtilisateurDto) {
    return this.utilisateursService.update(id, updateUtilisateurDto);
  }

  // 🔒 Seuls les ADMIN peuvent supprimer
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.utilisateursService.remove(id);
  }

  // 🔒 Seuls les ADMIN peuvent uploader des avatars
  @Post('upload/:id/avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    }
  }),
  }))
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided'); 
    const avatar = `/uploads/avatars/${file.filename}`;

    // Met à jour le champ avatar (utilise UpdateUtilisateurDto)
    const updateResult = await this.utilisateursService.update(id, { avatar } as any);
    return updateResult;
  }
}
