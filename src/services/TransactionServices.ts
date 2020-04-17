import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoryServices from './CategoryServices';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface ListAllResponse {
  transactions: Transaction[];
  balance: Balance;
}

interface CreateRequest {
  title: string;
  value: number;
  type: string;
  category: string;
}

class TransactionServices {
  private catServices = new CategoryServices();

  private createTransRepo(): TransactionsRepository {
    return getCustomRepository(TransactionsRepository);
  }

  public async listAll(): Promise<ListAllResponse> {
    const transRepo = await this.createTransRepo();
    const transactions = await transRepo.find();
    const balance = await transRepo.getBalance();

    return { transactions, balance };
  }

  public async create(request: CreateRequest): Promise<Transaction> {
    const transRepo = await this.createTransRepo();
    const { title, value, type } = request;

    const absoluteVal = Math.abs(value);
    const categoryTitle = request.category;
    const balance = await transRepo.getBalance();
    
    if (!title || !value || !type)
      throw new AppError('Request must include title, type and value', 401);
    if (type !== 'income' && type !== 'outcome')
      throw new AppError('Type must be either "income" or "outcome"', 401);
    if (type == 'outcome' && balance.total - value < 0)
      throw new AppError(
        `Transaction value can't be greater than current balance(${balance.total})`,
      );

    const category = await this.catServices.findOrCreateByTitle(categoryTitle);

    const newTrans = transRepo.create({
      title,
      value: absoluteVal,
      type,
      category_id: category.id,
    });

    const savedTrans = await transRepo.save(newTrans);
    return savedTrans;
  }

  public async delete(id: string): Promise<void> {
    const transRepo = await this.createTransRepo();
    await transRepo.delete({ id });
    return;
  }

  // public async import(): Promise<Transaction[]> {
  // }
}

export default TransactionServices;
