package com.example.payment_service.service;

import com.example.payment_service.data.Payment;
import com.example.payment_service.data.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentByID(int id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment addPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Payment paymentDetails) {
        return paymentRepository.save(paymentDetails);
    }

    public void deletePaymentByID(int id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> getPaymentsByUserId(int userId) {
        return paymentRepository.getPaymentsByUserId(userId);
    }
}
