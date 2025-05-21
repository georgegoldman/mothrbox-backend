import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JWT_SECRET } from 'src/config/utils/src/util.constants';
import { UserModule } from 'src/users/users.module';
import { OtpModule } from 'src/otp/otp.module';
import { MailModule } from 'src/mail/mail.module';

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
    OtpModule,
    MailModule,
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
