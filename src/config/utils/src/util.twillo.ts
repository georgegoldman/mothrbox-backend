import { Twilio } from 'twilio';
import {
  TWILLO_ACCOUNT_ID,
  TWILLO_AUTH_TOKEN,
  TWILLO_FROM_NUMBER,
} from './util.constants';

export const TwilioSms = async (phoneNumber: string, template: string) => {
  const client = new Twilio(TWILLO_ACCOUNT_ID, TWILLO_AUTH_TOKEN);

  await client.messages.create({
    body: template,
    from: TWILLO_FROM_NUMBER,
    to: `${phoneNumber}`,
  });

  return;
};
