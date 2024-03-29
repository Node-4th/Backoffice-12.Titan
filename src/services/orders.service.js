import {
  ApiError,
  BadRequestError,
  NotFoundError,
} from '../middlewares/error-handling.middleware.js';

export class OrderService {
  constructor(orderRepository, cartRepository) {
    this.orderRepository = orderRepository;
    this.cartRepository = cartRepository;
  }

  createOrderByCart = async (userId, address) => {
    // 카트에 주문할 것이 있는지 확인
    const carts = await this.cartRepository.getCartsByUserId(userId);
    if (carts.length === 0) throw new NotFoundError('장바구니가 텅 비었어요.');

    let totalPrice = 0;
    for (let i = 0; i < carts.length; i++) {
      const menu = await this.cartRepository.getMenuById(carts[i].menuId);
      totalPrice += menu.price * carts[i].quantity;
    }
    // 배송비
    const shippingFee = await this.orderRepository.getShippingFeeByStoreId(
      carts[0].storeId
    );

    totalPrice += shippingFee;

    // 사용자의 포인트 확인 : 포인트 < totalPrice면 에러
    const point = await this.orderRepository.getPointById(userId);
    if (point < totalPrice) throw new ApiError('포인트가 부족합니다.');

    carts.totalPrice = totalPrice;

    // address를 입력하지 않았으면 User 테이블의 사용자 address로 배송
    if (address == undefined || address == null) {
      address = await this.orderRepository.getAddressByUserId(userId);
      if (address == null) throw new BadRequestError('배송지를 입력해주세요.');
    }

    // 있으면 주문 생성
    const order = await this.orderRepository.createOrderByCart(
      carts,
      userId,
      address
    );
    return order;
  };

  getOrdersByOwnerId = async (ownerId) => {
    const storeId = await this.orderRepository.getStoreIdByOwnerId(ownerId);
    if (storeId == null) throw new NotFoundError('존재하지 않는 가게입니다.');
    const orders = await this.orderRepository.getOrdersByStoreId(storeId.id);
    return orders;
  };

  getOrdersByUserId = async (userId) => {
    const orders = await this.orderRepository.getOrdersByUserId(userId);
    return orders;
  };

  updateStatus = async (orderId, status) => {
    // 주문 존재하는지 확인
    const order = await this.orderRepository.getOrderById(orderId);
    if (!order) throw new NotFoundError('해당 주문이 존재하지 않습니다.');

    const order_status = [
      'ORDER_COMPLETE',
      'PREPARING',
      'DELIVERING',
      'DELIVERY_COMPLETE',
    ];

    if (
      !status ||
      status == undefined ||
      order_status.includes(status) == false
    )
      throw new BadRequestError('잘못된 상태입니다.');

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      status
    );

    return updatedOrder;
  };

  createOrderByMenu = async (userId, menuId, quantity = 1, address) => {
    const menu = await this.cartRepository.getMenuById(menuId);
    const shippingFee = await this.orderRepository.getShippingFeeByStoreId(
      menu.storeId
    );
    const totalPrice = menu.price * quantity + shippingFee;

    const point = await this.orderRepository.getPointById(userId);
    if (point < totalPrice) throw new ApiError('포인트가 부족합니다.');

    // address를 입력하지 않았으면 User 테이블의 사용자 address로 배송
    if (address == undefined || address == null) {
      address = await this.orderRepository.getAddressByUserId(userId);
      if (address == null) throw new BadRequestError('배송지를 입력해주세요.');
    }

    const order = await this.orderRepository.createOrderByMenu(
      userId,
      menu.storeId,
      totalPrice,
      address
    );
    return order;
  };
}
