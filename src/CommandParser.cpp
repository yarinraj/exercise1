#include "DataManager.h"
#include <sstream>
#include <vector>
#include "RecommendationLogic.h"
#include <iostream>

#include "AddCommand.h"
#include "HelpCommand.h"

void parseCommand(const std::string& line, DataManager& dataManager) {

    std::istringstream iss(line);
    std::string command;
    
    //Retrieving the first word in the line (which is the name of the command)
    iss >> command;
    
    if (command == "add") {
        executeAddCommand(line, iss, dataManager);
    } 
    else if (command == "recommend") {
        std::string userId;
        std::string productId;
       

        //The recommend command has to include 2 parameters. Therefore , if there are less than we ignore the command . 
        if (!(iss >> userId >> productId)) {
            return; 
        }
        //making the recommendations
         auto allUserData = dataManager.getFormattedData();
        auto scores = GenerateProductScore(userId,productId,allUserData);
        auto recommendations = FilterAndSortRecommendations(scores);
        for(size_t i = 0; i<recommendations.size();i++){
            std:: cout<<recommendations[i]<<(i == recommendations.size()-1 ? "" : " ");
        }
        std::cout<<std::endl;
       

    } 
    else if (command == "help") {
        executeAddCommand();
    } 
    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        return; 
    }
}