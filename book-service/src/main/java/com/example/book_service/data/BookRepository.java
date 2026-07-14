package com.example.book_service.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    @Query("SELECT b FROM Book b WHERE b.title = :name")
    List<Book> getBooksByName(@Param("name") String name);

    @Query("SELECT b FROM Book b WHERE b.isbn = :isbn")
    List<Book> getBooksByIsbn(@Param("isbn") String isbn);

    @Modifying
    @Transactional
    @Query("UPDATE Book b SET b.stock = b.stock - :quantity WHERE b.id = :id AND b.stock >= :quantity")
    int reserveStock(@Param("id") int id, @Param("quantity") int quantity);

    @Modifying
    @Transactional
    @Query("UPDATE Book b SET b.stock = b.stock + :quantity WHERE b.id = :id")
    int releaseStock(@Param("id") int id, @Param("quantity") int quantity);
}
