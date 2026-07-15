import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() body: { email: string; name?: string }) {
    return this.authService.register(body);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Query('userId') userId: string) {
    return this.authService.getProfile(userId);
  }
}
