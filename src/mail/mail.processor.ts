import { Processor } from '@nestjs/bull';
import { MailService } from './mail.service';
import { QUEUE_CONSTANT } from 'src/config/utils/src/util.constants';

@Processor(QUEUE_CONSTANT.EMAIL.name)
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}
}
