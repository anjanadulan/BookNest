package com.example.book_service.controller;

import com.example.book_service.data.Book;
import com.example.book_service.service.BookService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
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


}
