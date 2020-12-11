# TinyApp Project

TinyApp is a full stack web application built with Node.js and Express that allows users to shorten long URLs (à la bit.ly).
It allows users to register with their emails and a password, and store their URLs in an index they can access.
Passwords are hashed and cookies are encrypted.

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- When running the app, be sure to end a session by clicking "Logout". Otherwise cookies will not be cleared, and app could
  crash if you stop and run the app again while being logged in.
