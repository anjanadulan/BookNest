package com.example.order_service.controller;

import com.example.order_service.data.Order;
import com.example.order_service.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping(path = "/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping(path = "/orders/{id}")
    public Order getOrderByID(@PathVariable int id) {
        return orderService.getOrderByID(id);
    }

    @PostMapping(path = "/orders")
    public Order addOrder(@RequestBody Order newOrder) {
        return orderService.addOrder(newOrder);
    }

    @PutMapping(path = "/orders")
    public Order updateOrder(@RequestBody Order orderDetails) {
        return orderService.updateOrder(orderDetails);
    }

    @DeleteMapping(path = "/orders/{id}")
    public void deleteOrderById(@PathVariable int id) {
        orderService.deleteOrderByID(id);
    }

    @GetMapping(path = "/orders", params = {"userId"})
    public List<Order> getOrdersByUserId(@RequestParam int userId) {
        return orderService.getOrdersByUserId(userId);
    }
}
