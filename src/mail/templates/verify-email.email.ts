import {
  ISendResetPasswordEmailTemplate,
  IVerifyEmailTemplate,
} from 'src/common/interface';
import { OTP_EXPIRATION_TIME_IN_WORDS } from 'src/config/utils/src/util.constants';
import { baseTemplate } from './base-template.mail';

export function VerifyEmailTemplate(data: IVerifyEmailTemplate) {
  const content = `
    <p style='font-size:1.1em'>Hi,</p>
    <p>Verify your email with the code below. This code
      <b>expires</b>
      in ${OTP_EXPIRATION_TIME_IN_WORDS}</p>
    <h2>${data.code}</h2>
  `;

  return baseTemplate({
    title: 'Verify Your Email',
    content: content,
  });
}

export function VerifyPhoneTemplate(data: IVerifyEmailTemplate) {
  const content = `
    <p style='font-size:1.1em'>Hi,</p>
    <p>Verify your phone number with the code below. This code
      <b>expires</b>
      in ${OTP_EXPIRATION_TIME_IN_WORDS}</p>
    <h2>${data.code}</h2>
  `;

  return baseTemplate({
    title: 'Verify Your Phone',
    content: content,
  });
}
export function ForgotPasswordTemplate(data: ISendResetPasswordEmailTemplate) {
  const content = `
    <p style='font-size:1.1em'>Hi,</p>
    <p>This is the code to reset your password. This code
      <b>expires</b>
      in 5 minutes</p>
    <h2
      style='margin: 0 auto;width: max-content;padding: 0 10px;color: #000;border-radius: 4px; letter-spacing: 4px;'
    >${data.code}</h2>
  `;

  return baseTemplate({
    title: 'Reset Your Password',
    content,
  });
}
