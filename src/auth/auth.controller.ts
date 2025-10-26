import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import { JwtRefreshGuard } from './jwt-refresh.guard';

// Swagger decorators
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

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
  // swagger docs
  @ApiOperation({ summary: 'User login and session creation' })
  @ApiResponse({ status: 200, description: 'User logged in successfully with access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }
  // ###############################################

  // Endpoint refresh (rotation)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  // swagger docs
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Req() req: Request) {

    // req.user est fourni par JwtRefreshStrategy (userId, email, role, jti, sessionId)
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // authService.refresh() renvoie { accessToken, refreshToken }
    return this.authService.refresh((req as any).user, ip, userAgent);
  }

  // Logout (revoke current session)
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  // swagger docs
  @ApiOperation({ summary: 'Logout from current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request) {
    const { jti } = (req as any).user;
    return this.authService.logout(jti);
  }

  // Logout from all sessions (revoke all sessions for a user)
  @UseGuards(JwtRefreshGuard)
  @Post('logout-all')
  // swagger docs
  @ApiOperation({ summary: 'Logout from all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out successfully' })
  async logoutAll(@Req() req: Request) {
    const { userId } = (req as any).user;
    return this.authService.logoutAllSessions(userId);
  }
}
