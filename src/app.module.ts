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

@Module({
  imports: [
    HttpModule,
    UserModule,
    AuthModule,
    WalletModule,
    KeysModule,
    EncryptionModule,
    StorageModule,
    EncryptionModule,
    MongooseModule.forRoot(DB_CONNECTION_STRING),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
