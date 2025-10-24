export const IPaymentGatewayPort = Symbol('IPaymentGatewayPort');
export interface IPaymentGatewayPort {
  createPaymentUrl(): Promise<void>;
}
