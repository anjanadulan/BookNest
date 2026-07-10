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
        validateOrder(order);
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order);
            }
        }
        return orderRepository.save(order);
    }

    public Order updateOrder(Order orderDetails) {
        validateOrder(orderDetails);
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

    private void validateOrder(Order order) {
        if (order == null || order.getUserId() <= 0 || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("An order must have a user and at least one item");
        }
        double calculatedTotal = 0;
        for (OrderItem item : order.getOrderItems()) {
            if (item.getBookId() <= 0 || item.getQuantity() <= 0 || item.getPrice() == null || item.getPrice() < 0) {
                throw new IllegalArgumentException("Order items must contain valid book, quantity, and price values");
            }
            calculatedTotal += item.getPrice() * item.getQuantity();
        }
        if (order.getTotalAmount() == null || Math.abs(calculatedTotal - order.getTotalAmount()) > 0.01) {
            throw new IllegalArgumentException("Order total does not match its items");
        }
    }
}
