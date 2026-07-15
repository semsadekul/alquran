import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: { email: string; name?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existing) throw new ConflictException('Email already registered');

    return this.prisma.user.create({
      data: { email: data.email, name: data.name }
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async findOrCreateByEmail(email: string, name?: string) {
    let user = await this.prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name }
      });
    }
    return user;
  }
}
