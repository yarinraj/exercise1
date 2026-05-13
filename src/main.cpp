#include <iostream>
#include "CommandParser.h"
#include <string>
#include "DataManager.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include<unistd.h>



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
     return 0;
 }
    
   
