import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { OrderController } from '../controllers/orders.controller.js';
import { OrderService } from '../services/orders.service.js';
import { OrderRepository } from '../repositories/orders.repository.js';
import { CartRepository } from '../repositories/carts.repository.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/auth-role.middleware.js';

const router = express.Router();

const cartRepository = new CartRepository(prisma);
const orderRepository = new OrderRepository(prisma);
const orderService = new OrderService(orderRepository, cartRepository);
const orderController = new OrderController(orderService);

/** 카트로 주문하기(고객) */
router.post(
  '/user/cart/order',
  authenticateUser,
  checkRole('CUSTOMER'),
  orderController.createOrderByCart
);

/** 주문 확인하기(고객, 사장) */
router.get('/user/order', authenticateUser, orderController.getOrders);

/** 주문 상태 변경하기 (사장) */
router.patch(
  '/user/order/:orderId',
  authenticateUser,
  checkRole('OWNER'),
  orderController.updateStatus
);

/** 메뉴로 주문하기(고객) */
router.post(
  '/menu/:menuId/order',
  authenticateUser,
  checkRole('CUSTOMER'),
  orderController.createOrderByMenu
);

export default router;
