#include "AddCommand.h"
#include <vector>

void executeAddCommand(const std::string& line, std::istringstream& iss, DataManager& dataManager) {
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
}