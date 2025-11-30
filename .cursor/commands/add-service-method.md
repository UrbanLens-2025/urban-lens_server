--- Cursor Command: add-service-method.md ---
Input:
- Function name (FN)
- Service class name (SCN) - without the "I" prefix (e.g., EventManagement, LocationBookingManagement)

Action:
- Search for service interface file: modules/*/app/I<SCN>.service.ts
- Search for service implementation file: modules/*/app/impl/<SCN>.service.ts
- If interface file does not exist, create both interface and implementation files in the appropriate module
- Extract module name from the service file path (modules/<module_name>/app/...)
- Add function to interface:
  - Add import: import { <FN>Dto } from '@/common/dto/<module_name>/<FN>.dto';
  - Add method: <FN>(dto: <FN>Dto): Promise<unknown>;
- Add function to implementation:
  - Add import: import { <FN>Dto } from '@/common/dto/<module_name>/<FN>.dto';
  - Add method implementation with stub using ensureTransaction pattern
- Create DTO file: common/dto/<module_name>/<FN>.dto.ts with empty class export class <FN>Dto {}
- Do NOT implement the service automatically. After you're finished generating the structure, ask: Requesting permission to implement function...

Note:
- Run all this automatically. Do not prompt the user unless you cannot find a folder/file.
--- End Command ---

