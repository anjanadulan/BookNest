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
        validatePayment(payment);
        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Payment paymentDetails) {
        validatePayment(paymentDetails);
        return paymentRepository.save(paymentDetails);
    }

    public void deletePaymentByID(int id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> getPaymentsByUserId(int userId) {
        return paymentRepository.getPaymentsByUserId(userId);
    }

    private void validatePayment(Payment payment) {
        if (payment == null || payment.getOrderId() <= 0 || payment.getUserId() <= 0 || payment.getAmount() == null || payment.getAmount() <= 0 || payment.getPaymentMethod() == null || payment.getPaymentMethod().isBlank() || payment.getTransactionId() == null || payment.getTransactionId().isBlank()) {
            throw new IllegalArgumentException("Payment contains invalid required values");
        }
    }
}
