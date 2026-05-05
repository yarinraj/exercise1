#include "DataManager.h"
#include <sstream>
#include <vector>
#include <iostream>
#include "HelpCommand.h"

void parseCommand(const std::string& line, DataManager& dataManager) {

    std::istringstream iss(line);
    std::string command;
    
    //Retrieving the first word in the line (which is the name of the command)
    iss >> command;
    
    if (command == "add") {
        std::string userId;
        std::string productId;

        //If The words sepreated by "," than its elegal command, so we'll ignore it.
        if (line.find(',') != std::string::npos) {
        return; 
    }
        
        //An attempt to read the userID and the productID . If there are missing parameters we ignore the input and waits for the next command
        if (!(iss >> userId >> productId)) {
            return; 
        }
        
        std::vector<std::string> products;
        products.push_back(productId);
        
        //Reading the rest of the products , if there are . 
        while (iss >> productId) {
            products.push_back(productId);
        }
        
        dataManager.addProducts(userId, products);
        
        // TODO: קריאה לפונקציה האמיתית שלך שמוסיפה את הנתונים
        
    } 
    else if (command == "recommend") {
        std::string userId;
        std::string productId;
        
        //The recommend command has to include 2 parameters. Therefore , if there are less than we ignore the command . 
        if (!(iss >> userId >> productId)) {
            return; 
        }
        
        // TODO: קריאה לפונקציה שמחשבת המלצות ומדפיסה
    } 
    else if (command == "help") {
        executeAddCommand();
        // std::cout << "add [userid] [productid1] [productid2] ...\n";
        // std::cout << "recommend [userid] [productid]\n";
        // std::cout << "help\n";
    } 
    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        return; 
    }
}