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
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status:
      | 'pending'
      | 'timeout'
      | 'success'
      | 'send_birthday'
      | 'send_otp'
      | 'failed';
    reference: string;
    receipt_number: any;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string;
    display_text: string;
    log: any;
    fees: number;
    fees_split: any;
    authorization: object;
    customer: object;
    plan: any;
    split: object;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
    connect: any;
    transaction_date: string;
    plan_object: object;
    subaccount: object;
  };
}

export interface ChargeAccountResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    message?: string;
    status:
      | 'pending'
      | 'timeout'
      | 'success'
      | 'send_birthday'
      | 'send_otp'
      | 'failed';
    display_text: string;
  };
}

export interface ValidateAccountNumberResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}
