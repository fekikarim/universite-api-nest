import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../utilisateurs/schemas/utilisateur/utilisateur';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  // 🔒 Seuls les ADMIN peuvent créer des options
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateOptionDto) {
    return this.optionsService.create(dto);
  }

  // ✅ Accessible à tous les utilisateurs authentifiés
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.optionsService.findAll();
  }

  // ✅ Accessible à tous les utilisateurs authentifiés
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.optionsService.findOne(id);
  }

  // 🔒 Seuls les ADMIN peuvent mettre à jour
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateOptionDto) {
    return this.optionsService.update(id, dto);
  }

  // 🔒 Seuls les ADMIN peuvent supprimer
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.optionsService.remove(id);
  }
}