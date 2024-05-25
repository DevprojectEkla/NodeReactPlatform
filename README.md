# NodeAPI with Socket.io and WebRTC server

This is a full Node api Server built without Express in order to deepen my own knowledge of web development. I included the build.js files from my React Client so that the client can be served directly by the same server.  

- For the installation you will have to get your hand a bit dirty:  

    > - if you want the latest version of the client (optional but highly recommended)  

    > `git clone https://github.com/DevprojectEkla/ReactWebChatClient client/`  
    > `cd client/`  
    > `npm i`  
    >
    > - then run ./build.sh from inside the root dir of the project.

    > `./build.sh`

    - go into the root directory of the project and run:

    `npm i`  

    

> The app is installed but for the server to work you will need:
>   - to have a mongoDB database up and running an
>   - you will need to create your own SSL self-signed certificate with a passphrase by replacing the samples `key.pem` and `cert.pem` with your own inside the server/cert dir
>   - to create a `.env` file in the config/ directory with your credentials as is:
>
>   `PORT = 8000`  
>   `SERVER_PORT = 8000`  
>   `MONGO_URI = mongodb+srv://<username:key>.mtatfss.mongodb.net/?retryWrites=true&w=majority`  
>   `GOOGLE_CLIENT_ID = <your-google-app-id>.apps.googleusercontent.com`  
>   `GOOGLE_CLIENT_SECRET = <your google secret here>`  
>   `PASS_PHRASE = "<the passphrase to your self signed certificate>"`  
>
> and you should be good to go...  
