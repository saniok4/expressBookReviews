const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username: username }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken: accessToken, username: username };
    return res.status(200).json({message: "User successfully logged in"});
  }
  return res.status(401).json({message: "Invalid login. Check username and password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "No book found with ISBN " + isbn});
  }
  if (!review) {
    return res.status(400).json({message: "Please provide a review as a query, like ?review=Great%20book"});
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review for ISBN " + isbn + " successfully added/updated",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "No book found with ISBN " + isbn});
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "You have no review to delete for ISBN " + isbn});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "Review for ISBN " + isbn + " posted by " + username + " deleted",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
