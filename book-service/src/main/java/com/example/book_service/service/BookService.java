package com.example.book_service.service;

import com.example.book_service.data.Book;
import com.example.book_service.data.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }


    public Book getBookByID(@PathVariable int id) {
        return bookRepository.findById(id).orElse(null);
    }

    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Book bookDetails) {
        return bookRepository.save(bookDetails);
    }

    public void deleteBookByID(@PathVariable int id) {
        bookRepository.deleteById(id);
    }

    public List<Book> getBookByName(String name) {
        return bookRepository.getBooksByName(name);
    }

    public List<Book> getBookByIsbn(String isbn) {
        return bookRepository.getBooksByIsbn(isbn);
    }
}
