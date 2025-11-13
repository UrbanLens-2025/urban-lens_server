import { SePayPgClient } from 'sepay-pg-node';

export const sepayClient = new SePayPgClient({
  env: 'sandbox',
  merchant_id: 'SP-TEST-DA727543',
  secret_key: 'spsk_test_mgHtap4TGKKogwhpui878LZeaw2e8HXB'
});
