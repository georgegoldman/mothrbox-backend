/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const AllowAny = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);

export const NO_CACHE = 'noCache';
export const NoCache = () => SetMetadata(NO_CACHE, true);

export const CACHE_EXPIRY = 'cacheExpiry';
export const CacheExpiry = (expiry: number) =>
  SetMetadata(CACHE_EXPIRY, expiry);

export const LoggedInUserDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
