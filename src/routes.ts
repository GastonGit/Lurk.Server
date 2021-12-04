import { Router } from 'express';
import indexRouter from './routes/index';

const routes = Router();

routes.use('/', indexRouter);

export default routes;
