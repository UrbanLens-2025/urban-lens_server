# Cursor Command: add-notification-listener

## Input:
- Event constant name (ECN) - e.g., BOOKING_APPROVED_EVENT, LOCATION_REQUEST_APPROVED_EVENT
- Optional: Event module path (EMP) - path to the event file (will search if not provided)

## Action:

### 1. Locate Event Definition
- Search for event file containing ECN in modules/*/domain/event/*.event.ts
- Extract event class name (remove _EVENT suffix, convert to PascalCase)
- Extract module name from path (modules/<module_name>/domain/event/...)

### 2. Generate Listener Name
- Convert event constant to listener class name:
  - Example: `BOOKING_APPROVED_EVENT` → `BookingApprovedListener`
  - Remove `_EVENT` suffix
  - Convert SNAKE_CASE to PascalCase
  - Append "Listener"

### 3. Create Event Listener File
- Path: `src/modules/notification/app/event-listeners/<ListenerName>.listener.ts`
- Template:
```typescript
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  <EVENT_CONSTANT>,
  <EventClass>,
} from '<event_import_path>';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';

@Injectable()
export class <ListenerName> extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(<EVENT_CONSTANT>)
  handleEvent(event: <EventClass>) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);

      // TODO: Implement notification logic
      // 1. Fetch necessary data (booking, location, event, etc.)
      // 2. Identify recipient account(s)
      // 3. Send email notification
      // 4. Send Firebase notification
    });
  }
}
```

### 4. Update EmailTemplates Constant
- File: `src/common/constants/EmailTemplates.constant.ts`
- Generate template name from event (e.g., BOOKING_APPROVED_EVENT → BOOKING_APPROVED)
- Add to enum:
  ```typescript
  <TEMPLATE_NAME> = './<template-kebab-case>',
  ```
- Add to EmailSubjects:
  ```typescript
  [EmailTemplates.<TEMPLATE_NAME>]: '<Human Readable Title>',
  ```

### 5. Update NotificationTypes Constant
- File: `src/common/constants/Notifications.constant.ts`
- Add to enum:
  ```typescript
  <NOTIFICATION_TYPE> = '<NOTIFICATION_TYPE>',
  ```
- Add to NotificationsConstant:
  ```typescript
  [NotificationTypes.<NOTIFICATION_TYPE>]: {
    payload: {
      title: '<Title with {placeholders}>',
      body: '<Body with {placeholders}>',
    },
  },
  ```

### 6. Create Email Template Stub
- Path: `src/assets/templates/<template-kebab-case>.pug`
- Create basic pug template structure with placeholder content
- Use existing templates as reference (e.g., booking-approved.pug)

### 7. Register Listener in Module
- File: `src/modules/notification/Notification.module.ts`
- Add import:
  ```typescript
  import { <ListenerName> } from '@/modules/notification/app/event-listeners/<ListenerName>.listener';
  ```
- Add to providers array:
  ```typescript
  <ListenerName>,
  ```

## Naming Conventions:
- Event constant: SCREAMING_SNAKE_CASE (e.g., BOOKING_APPROVED_EVENT)
- Listener class: PascalCase + "Listener" (e.g., BookingApprovedListener)
- Template enum: SCREAMING_SNAKE_CASE without _EVENT (e.g., BOOKING_APPROVED)
- Template file: kebab-case.pug (e.g., booking-approved.pug)
- Notification type: Same as template enum (e.g., BOOKING_APPROVED)

## Output Message:
After completion, display:
```
✅ Created event listener for <EVENT_CONSTANT>
   - Listener: src/modules/notification/app/event-listeners/<ListenerName>.listener.ts
   - Template: src/assets/templates/<template-name>.pug
   - Updated: EmailTemplates constant
   - Updated: NotificationTypes constant
   - Registered in: Notification.module.ts

⚠️  TODO: Implement notification logic in listener (marked with TODO comments)
⚠️  TODO: Customize email template content
```

## Notes:
- Do not automatically implement the notification logic - leave TODO comments
- Email template should be a basic stub with placeholder content
- Ensure all imports use absolute paths with '@/' prefix
- Follow existing listener patterns in the notifications module

