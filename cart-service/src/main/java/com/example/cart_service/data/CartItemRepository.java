package com.example.cart_service.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    @Query("SELECT c FROM CartItem c WHERE c.userId = :userId")
    List<CartItem> getCartItemsByUserId(@Param("userId") Integer userId);
}
