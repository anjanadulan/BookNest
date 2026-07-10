package com.example.cart_service.service;

import com.example.cart_service.data.CartItem;
import com.example.cart_service.data.CartItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    public CartItemService(CartItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

    public CartItem getCartItemByID(int id) {
        return cartItemRepository.findById(id).orElse(null);
    }

    public CartItem addCartItem(CartItem cartItem) {
        validateCartItem(cartItem);
        return cartItemRepository.save(cartItem);
    }

    public CartItem updateCartItem(CartItem cartItemDetails) {
        validateCartItem(cartItemDetails);
        return cartItemRepository.save(cartItemDetails);
    }

    public void deleteCartItemByID(int id) {
        cartItemRepository.deleteById(id);
    }

    public List<CartItem> getCartItemsByUserId(int userId) {
        return cartItemRepository.getCartItemsByUserId(userId);
    }

    private void validateCartItem(CartItem cartItem) {
        if (cartItem == null || cartItem.getUserId() <= 0 || cartItem.getBookId() <= 0 || cartItem.getQuantity() <= 0) {
            throw new IllegalArgumentException("Cart items require a valid user, book, and positive quantity");
        }
    }
}
