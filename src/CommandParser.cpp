#include "DataManager.h"
#include <sstream>
#include <vector>
#include "RecommendationLogic.h"
#include <iostream>

#include "AddCommand.h"
#include "HelpCommand.h"
#include "PostCommand.h"
#include "RecommendCommand.h"
void parseCommand(const std::string& line, DataManager& dataManager) {

    std::istringstream iss(line);
    std::string command;
    
    //Retrieving the first word in the line (which is the name of the command)
    iss >> command;
    
    if (command == "add") {
        executeAddCommand(line, iss, dataManager);
    } 
    else if (command == "recommend") {
        executeRecommendCommand(iss, dataManager);
    } 
    else if (command == "help") {
        executeHelpCommand();
    } 

    else if (command == "POST") {
        executePostCommand(iss, dataManager);
    }

    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        return; 
    }
}