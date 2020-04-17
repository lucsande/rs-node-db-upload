import { Router } from 'express';
import TransactionServices from '../services/TransactionServices';

const transactionsRouter = Router();
const transServs = new TransactionServices();

transactionsRouter.get('/', async (request, response) => {
  const transList = await transServs.listAll();
  return response.status(200).json(transList);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const trans = await transServs.create({
    title,
    value,
    type,
    category,
  });
  return response.status(200).json(trans);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await transServs.delete(id);

  return response.status(204).json({});
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
