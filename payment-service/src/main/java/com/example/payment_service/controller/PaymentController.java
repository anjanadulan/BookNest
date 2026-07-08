package com.example.payment_service.controller;

import com.example.payment_service.data.Payment;
import com.example.payment_service.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping(path = "/payments")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping(path = "/payments/{id}")
    public Payment getPaymentByID(@PathVariable int id) {
        return paymentService.getPaymentByID(id);
    }

    @PostMapping(path = "/payments")
    public Payment addPayment(@RequestBody Payment newPayment) {
        return paymentService.addPayment(newPayment);
    }

    @PutMapping(path = "/payments")
    public Payment updatePayment(@RequestBody Payment paymentDetails) {
        return paymentService.updatePayment(paymentDetails);
    }

    @DeleteMapping(path = "/payments/{id}")
    public void deletePaymentById(@PathVariable int id) {
        paymentService.deletePaymentByID(id);
    }

    @GetMapping(path = "/payments", params = {"userId"})
    public List<Payment> getPaymentsByUserId(@RequestParam int userId) {
        return paymentService.getPaymentsByUserId(userId);
    }
}
