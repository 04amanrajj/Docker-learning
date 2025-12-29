# Docker Learning Sandbox 🐳

A simple, lightweight, and visual sandbox project to demonstrate Docker containerization. This setup containerizes a beautiful, modern landing page using the ultra-lightweight **Nginx Alpine** image.

---

## 📂 Project Structure

- `Dockerfile`: Instructions for Docker to build our custom Nginx image.
- `index.html`: A visually rich, glassmorphic dark-mode dashboard tailored for Docker learning.

---

## 🚀 How to Build and Run

Make sure you have Docker installed and running on your system.

### 1. Build the Docker Image

Run the following command in this directory to build your image. The `-t` flag tags the image with a friendly name:

```bash
docker build -t docker-learning .
```

### 2. Run the Container

Launch a new container in detached (background) mode, mapping port `8080` of your host computer to port `80` of the container:

```bash
docker run -d -p 8080:80 --name my-learning-sandbox docker-learning
```

### 3. View the Application

Once started, open your web browser and navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🧹 Housekeeping

Here are some helpful commands to manage your running sandbox:

*   **View Running Containers:**
    ```bash
    docker ps
    ```
*   **Stop the Container:**
    ```bash
    docker stop my-learning-sandbox
    ```
*   **Start the Stopped Container:**
    ```bash
    docker start my-learning-sandbox
    ```
*   **Remove the Container:**
    ```bash
    docker rm my-learning-sandbox
    ```
*   **Remove the Image:**
    ```bash
    docker rmi docker-learning
    ```
