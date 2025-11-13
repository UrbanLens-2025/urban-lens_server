import { plainToInstance } from "class-transformer";

export class SEPayWebhookDto {
  timestamp: number;
  notification_type: string;

  order: {
    id: string;
    order_id: string;
    order_status: string;
    order_currency: string;
    order_amount: string;
    order_invoice_number: string;
    custom_data: any[];
    user_agent: string;
    ip_address: string;
    order_description: string;
  };

  transaction: {
    id: string;
    payment_method: string;
    transaction_id: string;
    transaction_type: string;
    transaction_date: string;
    transaction_status: string;
    transaction_amount: string;
    transaction_currency: string;
    authentication_status: string;
    card_number: string;
    card_holder_name: string;
    card_expiry: string;
    card_funding_method: string;
    card_brand: string;
  };

  customer: {
    id: string;
    customer_id: string;
  };

  static fromJson(json: Record<string, unknown>): SEPayWebhookDto {
    const instance = new SEPayWebhookDto();
    instance.timestamp = json.timestamp as number;
    instance.notification_type = json.notification_type as string;
    instance.order = json.order as any;
    instance.transaction = json.transaction as any;
    instance.customer = json.customer as any;
    return instance;
  }
}
