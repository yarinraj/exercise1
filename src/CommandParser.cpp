#include "DataManager.h"
#include <sstream>
#include <vector>
#include "RecommendationLogic.h"
#include <iostream>

#include "AddCommand.h"
#include "HelpCommand.h"
#include "PostCommand.h"
#include "RecommendCommand.h"
#include "PatchCommand.h"
#include "GetCommand.h"

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
    else if (command == "get") {
        executeGetCommand(iss, dataManager);
    }
    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        std::cout << "400 Bad Request" << std::endl;
        return;
    }
}