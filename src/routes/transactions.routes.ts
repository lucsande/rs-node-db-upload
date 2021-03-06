import { Router } from 'express';
import multer from 'multer';
import TransactionServices from '../services/TransactionServices';
import multerConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(multerConfig);

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

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const file = request.file;
    const transactions = await transServs.import(file.path);

    return response.status(200).json(transactions);
  },
);

transactionsRouter.delete('/delete_all', async (request, response) => {
  await transServs.deleteAll();

  return response.status(204).json({});
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await transServs.delete(id);

  return response.status(204).json({});
});

export default transactionsRouter;
