import Lurk from '../../lib/Lurk';
import { Router, Request, Response } from 'express';
const indexRouter = Router();

const lurk = new Lurk();
lurk.start();

indexRouter.get('/', (_req: Request, res: Response) => {
    res.send(lurk.getList());
});

export default indexRouter;
