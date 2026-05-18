#include "DataManager.h"
#include <sstream>
#include <vector>
#include "RecommendationLogic.h"
#include <iostream>
  #include "DeleteLogic.h"
#include "AddCommand.h"
#include "HelpCommand.h"
#include "PostCommand.h"
#include "RecommendCommand.h"
#include "PatchCommand.h"

void parseCommand(const std::string& line, DataManager& dataManager) {

    std::istringstream iss(line);
    std::string command;
    
    //Retrieving the first word in the line (which is the name of the command)
    iss >> command;

    //Changing all the letters in the command name to lower letters
    for (char& c : command) {
        c = std::tolower(c);
    }
    
    if (command == "add") {
        executeAddCommand(line, iss, dataManager);
    } 
    else if (command == "recommend") {
        executeRecommendCommand(iss, dataManager);
    } 
    else if (command == "help") {
        executeHelpCommand();
    } 

    else if (command == "post") {
        executePostCommand(iss, dataManager);
    }

    else if (command == "patch") {
        std::string response = executePatchCommand(line, iss, dataManager);
        std::cout << response << std::endl;
    }
   // Don't forget to include the header!


   else if (command == "delete") {
        // FIX 2: Extracting userId from the existing 'iss' stream
        std::string userId;
        iss >> userId;

        // FIX 3: Extracting all product IDs left in the stream
        std::string prodId;
        std::vector<std::string> productIds;
        while (iss >> prodId) {
            productIds.push_back(prodId);
        }

        // FIX 4: Call our decoupled logic using the correct variable name (dataManager)
        bool success = handleDeleteCommand(userId, productIds, dataManager);

        // FIX 5: Using std::cout because main.cpp captures this stream and sends it to the client!
        if (success) {
            std::cout << "200 OK" << std::endl;
        } else {
            std::cout << "404 Not Found" << std::endl;
        }
    }
    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        std::cout << "400 Bad Request" << std::endl;
        return;
    }
}