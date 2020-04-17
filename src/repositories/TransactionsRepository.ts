import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    const transactions = await this.find();
    transactions.forEach(trans => {
      if (trans.type === 'income') income += trans.value;
      if (trans.type === 'outcome') outcome += trans.value;
    });

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
