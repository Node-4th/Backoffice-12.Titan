import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { errorHandler } from '../middlewares/error-handling.middleware.js';
import { MenuRepository } from '../repositories/menus.repository.js';
import { MenuService } from '../services/menus.service.js';
import { MenuController } from '../controllers/menus.controller.js';
import { StoresRepository } from '../repositories/stores.repository.js';
import { StoresService } from '../services/stores.service.js';
import { StoresController } from '../controllers/stores.controller.js';

const router = express.Router();

// 의존성 주입
const menuRepository = new MenuRepository(prisma);
const menuService = new MenuService(menuRepository);
const menuController = new MenuController(menuService);
const storesRepository = new StoresRepository(prisma);
const storesService = new StoresService(storesRepository);

/**
 * 메뉴 등록
 */
router.post('/menu/:storeId', menuController.createMenu);

/**
 * 특정 업장 메뉴 전체 조회
 */
router.get('/all-menu/:storeId', menuController.getMenu);

/**
 * 메뉴 하나 조회
 */
router.get('/menu/:menuId', menuController.getMenuById);
/**
 * 메뉴 수정
 */
router.patch('/menu/:menuId', menuController.updateMenu);

/**
 * 메뉴 삭제
 */
router.delete('/menu/:menuId', menuController.deleteMenu);

router.use(errorHandler);

export default router;