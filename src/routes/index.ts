import HotClipsController from '../../lib/HotClipsController';
import { Router, Request, Response } from 'express';
const indexRouter = Router();

const hotClips = new HotClipsController();
hotClips.start();

indexRouter.get('/', (_req: Request, res: Response) => {
    res.send(hotClips.getList());
});

export default indexRouter;
