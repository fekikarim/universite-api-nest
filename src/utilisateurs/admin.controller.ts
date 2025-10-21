import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './schemas/utilisateur/utilisateur';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {

    // test endpoint
    // 🔒 Endpoint accessible uniquement aux ADMIN
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('dashboard')
    getAdminDashboard(@Req() req: Request & { user?: unknown }) {
        return { message: 'Welcome Admin', user: req.user };
    }

    // 🔒 Endpoint accessible aux ADMIN et ETUDIANT
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.ETUDIANT)
    @Get('profile')
    getProfile() {
        return {
        message: 'Voici votre profil protégé par JWT',
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('whoami')
    whoami(@Req() req: Request & { user?: unknown }) {
        return req.user; // affiche ce que JwtStrategy a renvoyé
    }

}