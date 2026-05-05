#include "DataManager.h"
#include <sstream>
#include <vector>
#include "RecommendationLogic.h"
#include <iostream>


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
        // TODO: הדפסת תפריט העזרה
    } 
    else {
        //The user entered an unfamiliar command. So the program ignores the command and waits for the next .
        return; 
    }
}