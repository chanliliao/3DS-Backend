import Order from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

//@desc   create new order
//@route  POST /api/orders
//@access Private
const addOrderItems = asyncHandler(async (req, res) => {
  // pull the data from the req
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  // check there are items
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('no order items');
    return;
  } else {
    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // create the order
    const createdOrder = await order.save();

    // sent back confirmation
    res.status(201).json(createdOrder);
  }
});

//@desc   get order by id
//@route  GET /api/orders/:id
//@access Private
const getOrderById = asyncHandler(async (req, res) => {
  // grab the order using the id
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  // check order and send back the data
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order Not Found');
  }
});

//@desc   update order to paid
//@route  PUT /api/orders/:id/pay
//@access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // grab order by id
  const order = await Order.findById(req.params.id);

  // check order if paid
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    // save the new data and return confirmation
    const updateOrder = await order.save();
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order Not Found');
  }
});

//@desc   update order to delivered
//@route  PUT /api/orders/:id/deliver
//@access Private/ admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  // grab order by id
  const order = await Order.findById(req.params.id);

  // check order and send confirmation
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order Not Found');
  }
});

//@desc   Get logged in user orders
//@route  GET /api/orders/myorders
//@access Private
const getMyOrders = asyncHandler(async (req, res) => {
  // get user's order by id
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

//@desc   Get all orders
//@route  GET /api/orders
//@access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // grab all orders
  const orders = await Order.find({}).populate('user', 'id name');

  res.json(orders);
});

//@desc   Delete orders
//@route  DELETE /api/orders/:id
//@access Private/Admin

//@desc   Update orders
//@route  PUT /api/orders/:id
//@access Private/Admin

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
};
