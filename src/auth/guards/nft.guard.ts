import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  SMART_CONTRACT_API,
} from 'src/config/utils/src/util.constants';
import { IS_PUBLIC_KEY } from '../auth.decorator';
@Injectable()
export class NftAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { publicKey: string } }>();
    const user = request.user;

    const publicKey = user?.publicKey;
    if (!publicKey) {
      throw new UnauthorizedException(
        'No public key found in token for NFT validation',
      );
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      SMART_CONTRACT_API,
      provider,
    );

    const isOwner = (await contract.isValidAccessKey(publicKey)) as boolean;

    if (!isOwner) {
      throw new UnauthorizedException('User does not own required NFT');
    }

    return true;
  }
}
