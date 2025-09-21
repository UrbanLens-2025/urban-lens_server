import { updateGlobalConfig } from 'nestjs-paginate';

updateGlobalConfig({
  defaultOrigin: undefined,
  defaultLimit: 20,
  defaultMaxLimit: 1000,
});
