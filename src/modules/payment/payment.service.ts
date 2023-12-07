import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  constructor() {}

  /**
   * TODO: Connect payment gateway
   */
  async makePayment() {}
  async addNewCard() {}
  async getCard() {}
  async getCards() {}
  async updateCard() {}
  async deleteCard() {}

  async withdrawFunds() {}
}
