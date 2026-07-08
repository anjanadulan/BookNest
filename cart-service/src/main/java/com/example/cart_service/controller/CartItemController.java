package com.example.cart_service.controller;

import com.example.cart_service.data.CartItem;
import com.example.cart_service.service.CartItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class CartItemController {

    private final CartItemService cartItemService;

    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @GetMapping(path = "/cart")
    public List<CartItem> getAllCartItems() {
        return cartItemService.getAllCartItems();
    }

    @GetMapping(path = "/cart/{id}")
    public CartItem getCartItemByID(@PathVariable int id) {
        return cartItemService.getCartItemByID(id);
    }

    @PostMapping(path = "/cart")
    public CartItem addCartItem(@RequestBody CartItem newCartItem) {
        return cartItemService.addCartItem(newCartItem);
    }

    @PutMapping(path = "/cart")
    public CartItem updateCartItem(@RequestBody CartItem cartItemDetails) {
        return cartItemService.updateCartItem(cartItemDetails);
    }

    @DeleteMapping(path = "/cart/{id}")
    public void deleteCartItemById(@PathVariable int id) {
        cartItemService.deleteCartItemByID(id);
    }

    @GetMapping(path = "/cart", params = {"userId"})
    public List<CartItem> getCartItemsByUserId(@RequestParam int userId) {
        return cartItemService.getCartItemsByUserId(userId);
    }
}
