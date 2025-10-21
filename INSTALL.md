# Running the App

To run the application, you need to use **Docker Compose**. This will set up and start the necessary services inside containers.

## Way 1: Running the Gateway API locally
Once the infrastructure is up and running, you can start the Gateway API without building the entire Docker image. To do this:

1. Set up your .env file

2. Start the Gateway API locally using the provided scripts:

- On **Linux/Mac**:
  ```sh
  ./start.sh
  ```

- On **Windows**:
  ```sh
  start.bat
  ```

Alternatively, you can use:

```sh
npm run start
```

##  Way 2: Start the Infrastructure

Run the following command to build the Docker image and start all services in **detached mode** (running in the background):
```sh
docker compose up -d --build
```


## Accessing the App
Once the app is running, you can access it by sending a GET request to:

http://localhost:3000/example/

This will trigger the example route handler and return a response.