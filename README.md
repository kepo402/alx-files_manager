# 📁 **Files Manager API** 📁

Welcome to the **Files Manager API** project! 🚀  
This is a powerful, scalable backend service built with **Node.js**, **Express**, **MongoDB**, **Redis**, and more, designed to manage and manipulate files easily. It’s built with modern JavaScript (ES6) and will allow users to upload, view, and manage files securely. 🔐

---

## 📜 **Project Overview** 

The Files Manager API allows you to:
- **Authenticate users** 🔑
- **Upload files** 📤
- **View files** 👀
- **List files** 📃
- **Change file permissions** 🔒
- **Generate image thumbnails** 🖼️

All of this is powered by **Node.js**, **Express**, **MongoDB**, **Redis**, and background processing tools like **Kue**.

---

## ⚙️ **Tech Stack** 💻

- **Backend Framework**: [Node.js](https://nodejs.org/) 🟩
- **Web Framework**: [Express.js](https://expressjs.com/) 🌐
- **Database**: [MongoDB](https://www.mongodb.com/) 🗄️
- **Caching**: [Redis](https://redis.io/) ⚡
- **Task Queue**: [Kue](https://www.npmjs.com/package/kue) 📊
- **File Handling**: Thumbnail Generation 🖼️

---

## 🛠️ **Installation**

To get started with the **Files Manager API**, follow these steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/kepo402/alx-files_manager.git
    ```

2. **Navigate to the project directory**:

    ```bash
    cd alx-files_manager
    ```

3. **Install the dependencies**:

    ```bash
    npm install
    ```

4. **Set up your environment variables**:

    Create a `.env` file in the root directory and configure the following:

    ```bash
    DB_HOST=localhost
    DB_PORT=27017
    DB_DATABASE=files_manager
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

---

## 🏃 **Running the Project**

To run the server in development mode with live reloading, use the following command:

```bash
npm run dev
