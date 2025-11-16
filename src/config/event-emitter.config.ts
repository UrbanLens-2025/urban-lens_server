import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';

export const EventEmitterConfig: EventEmitterModuleOptions = {
  global: true,
  ignoreErrors: false,
};
