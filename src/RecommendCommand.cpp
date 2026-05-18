#include "RecommendCommand.h"
#include "RecommendationLogic.h" 
#include <iostream>
#include <vector>
#include <string>

void executeRecommendCommand(std::istringstream &iss, DataManager& dataManager){
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
