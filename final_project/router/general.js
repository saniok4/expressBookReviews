const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(409).json({message: "Username already exists"});
  }

  users.push({ username: username, password: password });
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({message: "No book found with ISBN " + isbn});
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const keys = Object.keys(books);
  const matches = [];

  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      matches.push({ isbn: key, ...books[key] });
    }
  });

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: matches }, null, 4));
  }
  return res.status(404).json({message: "No books found for author " + req.params.author});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const keys = Object.keys(books);
  const matches = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      matches.push({ isbn: key, ...books[key] });
    }
  });

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: matches }, null, 4));
  }
  return res.status(404).json({message: "No books found with title " + req.params.title});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "No book found with ISBN " + isbn});
});

module.exports.general = public_users;
