# Urban Threads

**Urban Threads** is a trendy online clothing store built as part of a **Full Stack Development Bootcamp assignment with ZAIO**. The project was designed to put full-stack development concepts into practice by building a functional e-commerce application from the ground up, including product management, user authentication, and shopping cart functionality.

The application represents a fictional streetwear brand focused on casual clothing for young adults, offering products such as **Hoodies, T-shirts, Sneakers, and Accessories**. The project uses **Firebase Firestore** as the backend database and **Firebase Authentication** for managing user accounts, while the frontend is built with **HTML, CSS, and JavaScript**.

---

## Project Overview

Urban Threads allows users to browse a dynamically generated product catalogue, create an account, log in, add products to their shopping cart, and review their order before checkout.

All product information is retrieved dynamically from **Firebase Firestore**, while authentication is handled through **Firebase Authentication**.

The project demonstrates practical implementation of:

* Frontend web development
* Firebase integration
* Database management
* User authentication
* CRUD operations
* Shopping cart functionality
* Responsive web design
* JavaScript DOM manipulation
* Full-stack application structure

---

## Features

### Product Browsing

* Dynamically loads products from Firebase Firestore
* Displays product name, price, category, description, and image
* Supports different product categories:

  * Hoodies
  * T-shirts
  * Sneakers
  * Accessories

### Authentication

Users can:

* Create an account
* Log in
* Log out
* Access their account information
* See their logged-in email/name in the navigation bar

Authentication is handled using **Firebase Authentication**.

### Shopping Cart

Users can:

* Add products to their cart
* Remove products from their cart
* View products currently in their cart
* See product quantities
* View the total cost of their cart

Cart functionality is restricted to authenticated users.

### Checkout

The cart page provides a summary of the selected products and calculates the total cost before checkout.

### Responsive Design

The website uses modern **CSS Flexbox and Grid** techniques to provide a responsive layout across different screen sizes.

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend / Database

* Firebase Firestore
* Firebase Authentication

### Development Tools

* Git
* GitHub
* Visual Studio Code

---

## Firebase Structure

### Products Collection

Product information is stored in the Firestore `products` collection.

Example document:

```javascript
{
  name: "Oversized Hoodie",
  price: 49.99,
  category: "Hoodies",
  description: "Soft cotton hoodie in oversized fit.",
  imageURL: "https://example.com/hoodie.jpg"
}
```

### Authentication

Firebase Authentication manages user registration and login using the configured authentication provider.

Each authenticated user can access their own shopping cart.

---

## Project Structure

```text
Urban-Threads/
│
├── index.html          # Landing page
├── shop.html           # Product listing
├── login.html          # Login and signup
├── cart.html           # Shopping cart and checkout
├── orders.html         # Orders page
├── wishlist.html       # Wishlist page
├── seed.html           # Product/database seeding
│
├── server.js           # Server-side functionality
├── package.json        # Project dependencies
├── package-lock.json   # Dependency lock file
│
├── css/
│   └── ...
│
├── js/
│   └── ...
│
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MartinDev-ops/Urbanthreads-.git
```

### 2. Navigate Into the Project

```bash
cd Urbanthreads-
```

### 3. Install Dependencies

If the project contains Node.js dependencies:

```bash
npm install
```

## User Flow

```text
Landing Page
      ↓
   Shop Page
      ↓
Browse Products
      ↓
Add Product to Cart
      ↓
Authentication
      ↓
   Cart Page
      ↓
Review Order
      ↓
   Checkout
```

---

## Assignment Objectives

This project was developed to demonstrate the practical application of concepts covered during the **ZAIO Full Stack Development Bootcamp**.

The main objectives included:

1. Building a functional web application.
2. Connecting a frontend application to Firebase.
3. Retrieving and displaying dynamic data from Firestore.
4. Implementing user authentication.
5. Managing user-specific shopping carts.
6. Creating a responsive user interface.
7. Using Git and GitHub for version control and project submission.

---

## What I Learned

Through the development of Urban Threads, I gained practical experience with:

* Integrating Firebase into a web application
* Working with Firestore collections and documents
* Implementing authentication using Firebase Authentication
* Managing application state with JavaScript
* Dynamically rendering products
* Building shopping cart functionality
* Structuring a multi-page web application
* Creating responsive layouts
* Using Git for version control
* Managing and publishing projects using GitHub

---

## Future Improvements

Possible future improvements include:

* Online payment integration
* Product search and advanced filtering
* Product reviews and ratings
* Persistent order history
* Admin dashboard for managing products
* Inventory management
* User profile management
* Improved checkout flow
* Order confirmation emails
* Deployment with a production hosting platform

---

## License

This project was created for educational purposes as part of a ZAIO Full Stack Development Bootcamp assignment.
