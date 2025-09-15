import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import * as admin from 'firebase-admin';
import { Provider } from '@nestjs/common';

export const FirebaseAdminProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  inject: [ConfigService],
  useFactory: (configService: ConfigService<Environment>) => {
    return admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n')
          .replace(/\\r/g, ''),
        projectId: configService.get('FIREBASE_PROJECT_ID'),
        clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
    });
  },
};
