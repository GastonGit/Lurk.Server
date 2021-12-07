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

/*

require('dotenv').config();

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');

let indexRouter = require('./routes');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;

 */
