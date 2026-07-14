package com.example.book_service.controller;

import com.example.book_service.data.Book;
import com.example.book_service.service.BookService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping(path = "/books")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping(path = "/books/{id}")
    public Book getBookByID(@PathVariable int id) {
        return bookService.getBookByID(id);
    }

    @PostMapping(path = "/books")
    public Book addBook(@RequestBody Book newBook) {
        return bookService.addBook(newBook);
    }

    @PutMapping(path = "/books")
    public Book updateBook(@RequestBody Book bookDetails) {
        return bookService.updateBook(bookDetails);
    }

    @DeleteMapping(path = "/books/{id}")
    public void deleteBookById(@PathVariable int id) {
        bookService.deleteBookByID(id);
    }

    @GetMapping(path = "/books", params = {"name"})
    public List<Book> getBookByName(@RequestParam String name) {
        return bookService.getBookByName(name);
    }

    @GetMapping(path = "/books", params = {"isbn"})
    public List<Book> getBookByIsbn(@RequestParam String isbn) {
        return bookService.getBookByIsbn(isbn);
    }

    @PostMapping(path = "/books/{id}/reserve")
    public ResponseEntity<Book> reserveStock(@PathVariable int id, @RequestParam int quantity) {
        try {
            return ResponseEntity.ok(bookService.reserveStock(id, quantity));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PostMapping(path = "/books/{id}/release")
    public ResponseEntity<Book> releaseStock(@PathVariable int id, @RequestParam int quantity) {
        try {
            return ResponseEntity.ok(bookService.releaseStock(id, quantity));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


}
