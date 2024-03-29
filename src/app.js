import express from 'express';
import UsersRouter from './routes/users.router.js';
import AuthRouter from './routes/auth.router.js';
import CartsRouter from './routes/carts.router.js';
import OrdersRouter from './routes/orders.router.js';
import StoresRouter from './routes/stores.router.js';
import menuRouter from './routes/menus.router.js';
import MainRouter from './routes/main.router.js';
import ReviewsRouter from './routes/reviews.router.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { sessionOption } from './utils/redis/redis.js';
import { errorHandler } from './middlewares/error-handling.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOption));
app.use('/', [
  UsersRouter,
  AuthRouter,
  CartsRouter,
  OrdersRouter,
  StoresRouter,
  menuRouter,
  MainRouter,
  ReviewsRouter,
]);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
