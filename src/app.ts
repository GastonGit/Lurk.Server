import express, { Application } from 'express';
import config from 'config';
import routes from './routes';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(
    cors({
        origin: config.get('domainOrigin'),
    }),
);
app.use(express.json());
app.use(routes);

app.listen(PORT, (): void => {
    console.log(`Server Running at http://localhost:${PORT}`);
});
