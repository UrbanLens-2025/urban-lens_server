import { Global, Module } from '@nestjs/common';
import { DelayedMessageProvider } from './DelayedMessage.provider';

@Global()
@Module({
  providers: [DelayedMessageProvider],
  exports: [DelayedMessageProvider],
})
export class DelayedMessageModule {}
