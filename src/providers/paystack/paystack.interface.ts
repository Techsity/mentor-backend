type InitializePaymentPayload = {
  amount: number;
  email: string;
  currency?: string | 'NGN';
  callback_url?: string;
  reference?: string;
  metadata?: object;
};

export interface PaystackInitializePaymentInput {
  payload: InitializePaymentPayload;
}

export interface PaystackInitializePaymentResponse {
  reference: string;
  status: boolean;
  authorization_url: string;
  access_code: string;
}

export interface PaystackVerifyTransactionResponse {
  status: string | boolean;
}
