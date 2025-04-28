import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserModule } from 'src/users/user.module';
import { JWT_SECRET } from 'libs/utils/src/util.constants';

@Module({
  imports: [
    {
      ...JwtModule.register({
        secret: JWT_SECRET,
        signOptions: { expiresIn: '365d' },
      }),
      global: true,
    },
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
