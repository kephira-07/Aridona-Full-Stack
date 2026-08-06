import express from 'express';
import { getConfig } from '../controller/configController.js';

const configRouter = express.Router();

configRouter.get('/', getConfig);

export default configRouter;
