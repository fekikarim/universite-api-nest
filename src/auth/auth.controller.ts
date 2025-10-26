import { Controller, Post, Body, Req, UseGuards, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { JwtRefreshGuard } from './jwt-refresh.guard';

// Swagger decorators
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // swagger docs
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  // ****************************************
  // Login before implementing refresh tokens
  // @Post('login')
  // async login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }
  // ****************************************

  // ###############################################
  // Login with refresh token and session management
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000} }) // Max 5 logins par minute
  // swagger docs
  @ApiOperation({ summary: 'User login and session creation' })
  @ApiResponse({ status: 200, description: 'User logged in successfully with access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(loginDto, ip, userAgent);

    // Set refresh token in HttpOnly cookie
    const crossSite = !!process.env.CORS_ORIGIN; // si défini → front cross-site
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true, // JavaScript cannot access
      secure: crossSite || process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: crossSite ? 'none' : 'strict', // Protection CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/api/auth', // Cookie accessible uniquement sur les routes d'auth (/api/auth/*)
    });

    // return ONLY the access token + user (no refresh token in body)
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
  // ###############################################

  // Endpoint refresh (rotation)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  // cookie http code
  @HttpCode(HttpStatus.OK)
  // throttler
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Max 10 refresh par minute
  // swagger docs
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    // req.user est fourni par JwtRefreshStrategy (userId, email, role, jti, sessionId)
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // authService.refresh() renvoie { accessToken, refreshToken }
    const result = await this.authService.refresh((req as any).user, ip, userAgent);

    // Mettre à jour le cookie refresh_token
    const crossSite = !!process.env.CORS_ORIGIN; 
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: crossSite || process.env.NODE_ENV === 'production',
      sameSite: crossSite ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/api/auth',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  // Logout (revoke current session)
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  // cookie http code
  @HttpCode(HttpStatus.OK)
  // swagger docs
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Logout from current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { jti } = (req as any).user;
    const result = await this.authService.logout(jti);

    // Clear the refresh token cookie
    const crossSite = !!process.env.CORS_ORIGIN; 
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: crossSite || process.env.NODE_ENV === 'production',
      sameSite: crossSite ? 'none' : 'strict',
      path: '/api/auth',
    });

    return result;
  }

  // Logout from all sessions (revoke all sessions for a user)
  @UseGuards(JwtRefreshGuard)
  @Post('logout-all')
  // cookie http code
  @HttpCode(HttpStatus.OK)
  // swagger docs
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out successfully' })
  async logoutAll(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId } = (req as any).user;
    const result = await this.authService.logoutAllSessions(userId);

    // Clear the refresh token cookie
    const crossSite = !!process.env.CORS_ORIGIN; 
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: crossSite || process.env.NODE_ENV === 'production',
      sameSite: crossSite ? 'none' : 'strict',
      path: '/api/auth',
    });

    return result;
  }
}
