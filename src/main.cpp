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
    std::cout<<"server starting om port: "<<port << std::endl;
    DataManager dataManager("data/database.txt");

     return 0;
 }
    
   
