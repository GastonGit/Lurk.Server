// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
//import HotClipsController from '../../lib/HotClipsController';
import { Router, Request, Response } from 'express';
const indexRouter = Router();

// const hotClips = new HotClipsController();
// hotClips.setupConnection();
// hotClips.start();

indexRouter.get('/', (req: Request, res: Response) => {
    // res.send(hotClips.getList());
    res.send('Boiler!');
});

export default indexRouter;
