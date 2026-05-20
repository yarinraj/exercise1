Markdown
# Recommendation System Server

## Overview
This project implements a TCP-based Recommendation System Server. The server manages a database of users and products, and processes incoming commands over a network connection to provide product recommendations, manage data, and more. 

## Project Structure
* src/ - Contains all .cpp and .h source files.
* data/ - Contains the database.txt file and any other persistent data.
* tests/ - Contains unit tests for the application logic.

## How To Run The Project:
### Step 1: Create the Shared Docker Network (Required Once)
``bash
docker network create my-network
### Step 2: Build and Run the Server
## Server Docker
build: docker build -f Dockerfile.server -t cpp-server .
run: docker run --name server --rm --network my-network -p 8000:8000 -v "$(pwd)/data:/app/data" cpp-server
### Step 3: Build and Run the Client
## Client Docker
build: docker build -f Dockerfile.client -t python-client .
run: docker run -it --rm --network my-network python-client server 8000

## How To Run The Unit Tests:
## Tests Docker
build: docker build -f Dockerfile.tests -t unit-tests .
run: docker run -it test_env

## How to Compile and Run (in the terminal)
*Compilation:*
We use standard g++ compilation. Open your terminal in the root directory and run:
```bash
g++ -std=c++17 -Iinclude -Isrc src/*.cpp -o server.exe
Running the Server:
Execute the compiled program and provide the desired port number as an argument:

Bash
./server.exe 8080
Execution Example (Client):
In a separate terminal, use nc (Netcat) to connect to the server and send commands:

Bash
nc localhost 8080
> POST 10 205
201 Created
> GET 10 205
200 OK
Product 101, Product 102
> exit
Architecture and SOLID Principles (OCP)
Our design heavily emphasizes Loose Coupling and the Open/Closed Principle (OCP). Below is an analysis of how our architecture handled the new requirements for Exercise 2:

1. Changing Command Names
Did it require modifying closed code? No.

Explanation: In our initial design (Ex1), the command mapping was implemented using a routing mechanism (CommandParser). Changing a command string (e.g., from add to POST) only required updating the specific route mapping or the command's own identifier, without altering the core parsing logic or the DataManager execution flow.

2. Adding New Commands
Did it require modifying closed code? No.

Explanation: The system is open for extension. To add a new command (like PATCH or DELETE), we simply implemented the new logic and registered it in the parser. The core engine that receives input and triggers commands remained completely untouched.

3. Changing Command Output Formats
Did it require modifying closed code? No.

Explanation: The output formatting is encapsulated within the specific command's execution logic. Changing the output format (e.g., adding HTTP-like statuses such as 200 OK or 404 Not Found) was done by extending the specific command's response builder, leaving the invoking classes closed to modification.

4. Transitioning from Console (std::cin/cout) to Sockets
Did it require modifying closed code? No.

Explanation: This is a prime example of our loose coupling. In Ex1, our application logic printed outputs directly to std::cout. To move to a network architecture, we did not modify the internal logic of our commands to take a socket file descriptor. Instead, we used a std::stringstream buffer and std::cout.rdbuf() in the server's outer loop to temporarily redirect the standard output into a string variable. This string is then sent over the TCP socket. The core application remains entirely agnostic to the delivery mechanism.

Future Scalability: Concurrency and Multiple Clients
Currently, the server processes one client sequentially. However, the code is closed to modification but open to extension for concurrent connections (e.g., supporting multiple clients simultaneously).

Because the internal logic is decoupled from the network layer, upgrading to a multithreaded server would merely require wrapping the inner while(true) loop (which handles the individual client_fd) into a separate function, such as handleClient(int client_fd). We could then spawn a new std::thread for every accepted connection:
std::thread(handleClient, client_fd).detach();
The core business logic (DataManager, CommandParser) would require zero changes regarding the network flow, aside from standard thread-safety measures (e.g., std::mutex for file/data writing).

Note: This project does not contain any sensitive keys, tokens, or personal passwords in the code or commit history.

