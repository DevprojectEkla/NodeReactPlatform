# Node.js Backend Server with HTTPS, WSS (Socket.io), WebRTC Signaling, MongoDB Integration, and API Functionality

My Node.js Backend Server supports HTTPS and WSS (Secure WebSockets via Socket.io) protocols, ensuring secure communication and real-time interaction within the application. The server provides API endpoints to manage data and business logic, serving as a robust backend for client-side applications. It also facilitates the WebRTC process by acting as a signaling server, handling the exchange of signaling messages necessary for establishing peer-to-peer connections.

Additionally, the backend server integrates with a MongoDB database, offering persistent data storage and retrieval capabilities. This setup ensures that the application can handle dynamic data management tasks, from user authentication to complex data queries, efficiently and securely.

To manage user authentication, the server uses session cookies. While this introduces some statefulness, it helps maintain secure and seamless user sessions across different interactions with the API.

## Key Features
- **HTTPS Protocol**: Ensures secure client-server communication for data fetching, form submissions, and RESTful API interactions, protecting data integrity and privacy.
- **WSS (Secure WebSocket) Protocol via Socket.io**: Enables secure, real-time, bidirectional communication between the server and clients, supporting features like live updates, chat applications, and notifications.
- **WebRTC Signaling**: Facilitates the initiation and establishment of peer-to-peer connections by managing the signaling process, including the exchange of offer/answer and ICE candidates.
- **MongoDB Integration**: Connects to a MongoDB database to perform CRUD operations, ensuring data persistence and efficient querying for various application needs.
- **API Endpoints**: Provides a set of RESTful API endpoints for clients to interact with the server, retrieve data, and perform various operations.
- **Session Cookies for Authentication**: Uses session cookies to manage user authentication and maintain secure sessions across API interactions.

> For a complete installation you will have to get your hand a bit dirty...
> Here are the main lines but you will have to set your own environment variables

## Server Installation  

    `git clone https://github.com/DevprojectEkla/NodeReactPlatform`  
    `cd NodeReactPlatform`  
    `npm i`  

> Now you have the server installed but you will need the client too  

## Client Installation  
    
    Inside the NodeReactPlatform/ directory run:  
    
    `git clone https://github.com/DevprojectEkla/ReactWebChatClient client/`  
    `cd client/`  
    `npm i`  
    
    - then run ./build.sh from inside the root dir of the project.  

    `./build.sh`  

    > this is nothing more than building the client React app and copying built
    > files into the server/build/ directory from where the files will be served

> ### BEWARE:
> The app is now installed but for the server to work you will need:
>   - to have a mongoDB database up and running and environment variables correctly configured
>   - you will need to create your own SSL self-signed certificate with a passphrase by replacing the samples `key.pem` and `cert.pem` with your own, inside the server/cert dir
>   - to declare those environment variables system wide or to create a `.env` file in the config/ directory with your credentials as is:
>
>   `PORT = 8000`  
>   `MONGO_URI = mongodb+srv://<username:key>.mtatfss.mongodb.net/?retryWrites=true&w=majority`  
>   `GOOGLE_CLIENT_ID = <your-google-app-id>.apps.googleusercontent.com`  
>   `GOOGLE_CLIENT_SECRET = <your google secret here>`  
>   `PASS_PHRASE = "<the passphrase to your self signed certificate>"`  
>   `NODE_ENV = "development" or "production"`  
>   `SALT_ROUNDS = <an int>`  
>   `PATH_KEY = "./your-path/key.pem"` 
>   `PATH_CERT = "./your-path/cert.pem"`  
>   `CLIENT_SESSION_COOKIE_EXP_TIME = XX # int in hour here`  
>   `SESSION_EXP_TIME = XX # in hour here`  
>   `MUTLIPART_BOUNDARY = "WhateverYoulike"`  
>   `DEFAULT_AVATAR_HASH_NAME ='XXXXX'`  
>   `DATA_PATH = "./your-path/data"`  
>   `ARTICLES_PATH = "your-path/articles/img"`  
>   `USERS_PATH = "users/avatars"`  
>   `AVATAR_PATTERN = "([0-9a-fA-F]{64})"`  
>   `MONGOOSE_ID_PATTERN = "([0-9a-fA-F]{24})"`  
>   `DEV_URL = "https://localhost:8000"`  
>   `GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'`  
>   `GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'`  
>   `API = {  
  "/": "GET",  
  "/api/articles": "GET",  
  "/api/articles/:id": "GET",  
  "/api/articles/create": "POST",  
  "/api/articles/update/:id": "PUT",  
  "/api/login": "POST",  
  "/api/subscribe": "POST",  
};`  
>   `STD_PORT = '3478'`  
>   `SSL_PORT = '5349'`  
>   `TURN_SERVER_URL = 'your-turn-server-address'`  
>   `STUN_SERVER_URL = 'your stun-server-adress'`  
>   `TURN_REALM = 'your-realm-here'`  
>   `TURN_STATIC_AUTH_SECRET = "your-secret-here"`  

> and you should be good to go...  
