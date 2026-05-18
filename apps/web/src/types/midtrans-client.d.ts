declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionParams {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      email?: string;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
      category?: string;
    }>;
    callbacks?: {
      finish?: string;
      error?: string;
    };
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransactionToken(params: TransactionParams): Promise<string>;
    createTransactionRedirectUrl(params: TransactionParams): Promise<string>;
  }

  const midtrans: { Snap: typeof Snap };
  export default midtrans;
}
