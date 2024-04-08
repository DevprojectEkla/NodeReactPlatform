This is a full Node api Server built without Express in order to deepen my own knowledge of web development. I included the build.js files from my React Client so that the client can be served directly by the same server. 
For the installation you will have to have your hand a bit dirty:




1) git clone https://github.com/DevprojectEkla/ReactWebChatClient client/
2) cd client/
3) npm i

then you will need to create a symlink to the config.js file of the server inside your node_modules dir (this way the config file can be imported with the simple require('config'))

4) cd node_modules && ln -s ../../config.js config

now do the same for the server go into the root directory of the project and run:

6) npm i
7) cd node_modules && ln -s ../config.js config

and then run ./build.sh from inside the root dir of the project.

8) ./build.sh

The app is installed but for the server to work you will need to have a mongoDB database up and running and you will need to create your own SSL self-signed certificate with a passphrase by replacing the samples key.pem and cert.pem with your own inside the server/cert dir and then
create a .env file in the config/ directory with your credentials as is:

PORT = 8000
SERVER_PORT = 8000
MONGO_URI = mongodb+srv://<username:key>.mtatfs
s.mongodb.net/?retryWrites=true&w=majority
GOOGLE_CLIENT_ID = <your-google-app-id>.apps.go
ogleusercontent.com
GOOGLE_CLIENT_SECRET = <your google secret here>
PASS_PHRASE = "<the passphrase to your self signed certificate>"

and you should be good to go...
