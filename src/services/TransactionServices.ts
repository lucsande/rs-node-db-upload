import { getCustomRepository } from 'typeorm';
import fs from 'fs';
import neatCsv from 'neat-csv';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CategoryServices from './CategoryServices';
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
    const transRepo = this.createTransRepo();
    const transactions = await transRepo.find();
    const balance = await transRepo.getBalance();

    return { transactions, balance };
  }

  public async create(request: CreateRequest): Promise<Transaction> {
    const transRepo = this.createTransRepo();
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

  public async import(filePath: string): Promise<Transaction[]> {
    const data = await fs.promises.readFile(filePath);
    const rows = await neatCsv(data);
    const createdTransactions = [] as Transaction[];

    for (const row of rows) {
      const trans = { ...row, value: parseFloat(row.value) } as any;
      const createdTransaction = await this.create(trans);

      createdTransactions.push(createdTransaction);
    }

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }

  public async delete(id: string): Promise<void> {
    const transRepo = this.createTransRepo();
    await transRepo.delete({ id });
    return;
  }

  public async deleteAll(): Promise<void> {
    const transRepo = this.createTransRepo();
    const allTrans = await this.listAll();
    const ids = allTrans.transactions.map(trans => trans.id);
    console.log(ids);

    ids.forEach(async id => await transRepo.delete({ id }));
    return;
  }
}

export default TransactionServices;
