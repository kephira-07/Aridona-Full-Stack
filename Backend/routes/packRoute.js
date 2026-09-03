import express from 'express';
import { listPacks, getPackBySlug, listPacksAdmin, createPack, updatePack, deletePack } from '../controller/packController.js';
import auth from '../middleware/auth.js';

const packRouter = express.Router();

packRouter.get('/', listPacks);
packRouter.get('/admin', auth(['admin']), listPacksAdmin);
packRouter.get('/:slug', getPackBySlug);
packRouter.post('/', auth(['admin']), createPack);
packRouter.put('/:id', auth(['admin']), updatePack);
packRouter.delete('/:id', auth(['admin']), deletePack);

export default packRouter;
