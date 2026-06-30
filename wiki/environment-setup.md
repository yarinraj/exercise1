## Infrastructure Orchestration with Docker Compose
The core backend engines, application servers, database instances, and web platforms are orchestrated concurrently as a single network stack via Docker Compose.

### Execution Guide
To compile, build, and initiate the internal container systems, open a terminal window at the repository root directory where the `docker-compose.yml` configuration is located and execute:

```bash
docker-compose up --build

The multi-container build lifecycle initializes four structural services:

cpp-server: Compiles the server binary using the specified compiler utilities inside the container context and listens internally on port 8000.

app-server: Installs node dependency packages, initializes the Express gateway connection to the database layer, and exposes port 8080.

frontend: Sets up the static compilation and development server for the React web application, mapping source folders to port 3000.

mongo: Fetches the official MongoDB image, mounting persistent local volumes and listening on port 27017.

Service Verification Matrix
After the automated compilation logs stabilize, you can check that all components are running concurrently by opening a separate host terminal window and executing:
docker ps
The tool output lists all active mapped system services
Named Storage Volume Strategy
To preserve application states permanently between development cycles and system reboots, a persistent named volume mount maps container data directly to host hardware:
volumes:
  - mongo-data:/data/db
  This ensures that newly generated registered users, restaurant documents, custom culinary dishes, and order histories are written directly to local storage. Even when running docker-compose down, data integrity remains secure across initializations.

Client Execution Guide (React Native Mobile Application)
Because native mobile virtual machines and emulator runtimes require access to host user-interface display engines and hardware acceleration layers, the React Native application runs locally outside the container environment.

Follow these sequential steps in a local host terminal window to boot up the mobile interface:

1. Project Directory Access
Navigate into the structural folder containing the mobile code packages:
cd bites-app
2. Dependency Bundle Assembly
Install the external libraries and layout modules specified in the configuration files:
npm install
3. Metro Bundler Initialization
Launch the JavaScript compilation packager pipeline:
npm start
4. Simulator Target Selection
Once the interactive console loader output displays, choose your target development interface:

Press a to compile, package, and load the dynamic mobile interface onto an active Android Emulator.

Press i to compile and run the native application package inside an iOS Simulator instance.


Alternative: Manual Local Execution (Without Docker)
If you prefer to run the backend components individually on your host machine rather than using Docker Compose, ensure you have a local instance of MongoDB running on port 27017, and execute the following commands in separate terminal windows:

1. Core Recommendation Engine (C++)
Navigate to the directory containing your C++ source files, generate the build artifacts, and execute the compiled binary:
cd cpp-server-directory
mkdir -p build
cd build
cmake ..
make
./app.out 8000
2. API Gateway Server (Node.js)
Before initializing the Node.js application, ensure your environment variables are configured to point to your local MongoDB instance. Navigate to the root directory and start the server application:
npm install
node app.js
3. Web Frontend Client (React)
Navigate to the web UI directory, install the required node module packages, and boot up the development web server:
cd wolt-frontend
npm install
npm start