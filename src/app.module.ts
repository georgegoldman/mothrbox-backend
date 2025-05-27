import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_CONNECTION_STRING } from 'src/config/utils/src/util.constants';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { UserModule } from './users/users.module';
import { KeysModule } from './keys/key.module';
import { HttpModule } from '@nestjs/axios';
import { EncryptionModule } from './encryption/encryption.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
// import { FastifyMulterModule } from '@nest-lab/fastify-multer';

@Module({
  imports: [
    HttpModule,
    UserModule,
    AuthModule,
    WalletModule,
    KeysModule,
    StorageModule,
    EncryptionModule,
    OtpModule,
    MailModule,
    MongooseModule.forRoot(DB_CONNECTION_STRING),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    // FastifyMulterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
