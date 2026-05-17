#include <iostream>
#include "CommandParser.h"
#include <string>
#include "DataManager.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include<unistd.h>
#include <sstream> // Required for capturing std::cout stream buffers into string representation

int main(int argc, char*argv[]) {

    //making sure the user wrote the port in the command line
    if(argc<2){
        std::cerr << "Usage: "<< argv[0]<<" <port>" << std::endl;
        return 1; 
    }
    //my port
    int port;
    try{
        port=std::stoi(argv[1]);
//checking the pory is in the correct numbers
        if(port<1024||port>65535){
        std::cerr <<"Error: Port must be between 1024 and 65535." << std::endl;
        return 1;
        }
        
    }catch (const std::exception& e){
        std::cerr << "Error: Invalid port number. Please provide a numeric value." << std::endl;
    return 1;
    }
    //socket
    std::cout<<"server starting on port: "<<port << std::endl;
    DataManager dataManager("data/database.txt");
    //creating the socket!(AF_INET = IPv4, SOCK_STREAM = TCP)
    int server_fd=socket(AF_INET, SOCK_STREAM,0);
    if(server_fd<0){
        perror ("socket creation faild");
        return 1;
    }
    //Set up the address structure
    struct sockaddr_in address;
    address.sin_family=AF_INET;
    // Accept connections from any IP
    address.sin_addr.s_addr=INADDR_ANY;
    // Use the port we got from argv
    address.sin_port = htons(port); 
    //bind the socket to the port
    if(bind(server_fd,(struct sockaddr *)&address,sizeof(address))<0){
        perror("bind failed");
        close(server_fd);
        return 1;
    } 
    //Listen for incoming connections (Queue size = 1)
    if (listen(server_fd, 1) < 0) {
        perror("listen failed");
        close(server_fd);
        return 1;
    }  
    std::cout << "Server is listening on port " << port << "..." << std::endl; 
    //accept the connection
    struct sockaddr_in client_addr;
    socklen_t client_len= sizeof(client_addr);
    //program stop and wait for the client
    int client_fd=accept(server_fd,(struct sockaddr *)&client_addr,&client_len);
    //checking if connection didnt work
    if(client_fd<0){
        perror("accept failed!");
        close(server_fd);
        return 1;
    }
    std::cout<< "Client connected! Waiting for message... "<<std::endl;
    while (true){
    //creating var for the client message
    std::string client_message="";
    char c;
    
    // Boolean flag to trace if the client closed connection or met an error
    bool client_disconnected = false;

    //opening loop to get bytes(chars)of the message untill get "\n" or if we get 0 bytes
    while(true){
        ssize_t bytes_received=recv(client_fd, &c,1,0);
        if(bytes_received<=0){
            // Set disconnect tracker to true before skipping out of the inner stream loop
            client_disconnected = true;
            break;   
        }
        if(c=='\n'){
            break;
        }
        //adding the message to the var we created byte by byte
        client_message+=c;

    }
    
    // Break the outer persistent loop if the client terminated the network session
    if (client_disconnected) {
        std::cout << "Client disconnected. Cleaning up resources..." << std::endl;
        break;
    }

    //print 
    std::cout<<"Message received from client : "<<client_message+"\n";
    
    // Optional utility condition to exit the session manually if client sends exit/quit
    if (client_message == "exit" || client_message == "quit") {
        break;
    }

    // Redirect standard console output stream (std::cout) to capture the parsed response internally
    std::stringstream buffer;
    std::streambuf* old_cout = std::cout.rdbuf(buffer.rdbuf());

    // Call the application business logic using the defined CommandParser engine
    parseCommand(client_message, dataManager);

    // Revert std::cout back to its native console behavior
    std::cout.rdbuf(old_cout);

    // Extract the execution output string collected inside the stringstream buffer
    std::string response = buffer.str();

    // Ensure the response string complies with the output framing rule (\n termination)
    if (response.empty() || response.back() != '\n') {
        response += "\n";
    }

    //the server send the "response" to the client
    send(client_fd, response.c_str(),response.length(),0);
 }
 
//close the connection to the client and the server
    close(client_fd);
    close(server_fd);
     return 0;
}