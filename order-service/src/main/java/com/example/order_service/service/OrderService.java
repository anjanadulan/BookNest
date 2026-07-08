package com.example.order_service.service;

import com.example.order_service.data.Order;
import com.example.order_service.data.OrderItem;
import com.example.order_service.data.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderByID(int id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order addOrder(Order order) {
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order);
            }
        }
        return orderRepository.save(order);
    }

    public Order updateOrder(Order orderDetails) {
        if (orderDetails.getOrderItems() != null) {
            for (OrderItem item : orderDetails.getOrderItems()) {
                item.setOrder(orderDetails);
            }
        }
        return orderRepository.save(orderDetails);
    }

    public void deleteOrderByID(int id) {
        orderRepository.deleteById(id);
    }

    public List<Order> getOrdersByUserId(int userId) {
        return orderRepository.getOrdersByUserId(userId);
    }
}
