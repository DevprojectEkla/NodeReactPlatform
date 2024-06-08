# NodeAPI with Socket.io and WebRTC server

This is a full Node api Server built without Express in order to deepen my own knowledge of web development. 
> For installation you will have to get your hand a bit dirty...  
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
>   `SERVER_PORT = 8000`  
>   `MONGO_URI = mongodb+srv://<username:key>.mtatfss.mongodb.net/?retryWrites=true&w=majority`  
>   `GOOGLE_CLIENT_ID = <your-google-app-id>.apps.googleusercontent.com`  
>   `GOOGLE_CLIENT_SECRET = <your google secret here>`  
>   `PASS_PHRASE = "<the passphrase to your self signed certificate>"`  
>   
> and you should be good to go...  
