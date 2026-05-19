#include "GetCommand.h"
#include "RecommendationLogic.h"
#include <iostream>

void executeGetCommand(std::istringstream& iss, DataManager& dataManager) {
    std::string userId;
    std::string productId;
    // parameter parsing (command responsability)
    if (!(iss >> userId >> productId)) {
        std::cout << "400 Bad Request" << std::endl;
        return;
    }

    // data validation 
    if (!dataManager.userExists(userId)) {
        std::cout << "404 Not Found" << std::endl;
        return;
    }

    // using the recommendation logic to get the recommendations for the user
    auto recommendations = RecommendationLogic::getRecommendations(userId, productId, dataManager.getFormattedData());
    // printing in the required format
    std::cout << "200 Ok" << std::endl << std::endl;
    for (size_t i = 0; i < recommendations.size(); ++i) {
        std::cout << recommendations[i] << (i == recommendations.size() - 1 ? "" : " ");
    }
}