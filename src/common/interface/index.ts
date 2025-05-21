import { UserDocument } from 'src/users/user.shemas';
import { OtpTypeEnum } from '../enums';

export interface IWelcomeEmailTemplate {
  name: string;
}

export interface IVerifyEmailTemplate {
  code: number;
}

export type ISendResetPasswordEmailTemplate = IVerifyEmailTemplate;

export interface IGenericOtpEmailTemplate {
  message: string;
  code: number;
  expirationTime: number;
}

export interface IRequestOtp {
  email: string;
  phone: string;
  type: OtpTypeEnum;
  code?: number;
  user?: UserDocument;
}
