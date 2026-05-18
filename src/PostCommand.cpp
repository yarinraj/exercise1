#include "PostCommand.h"
#include "DataManager.h"
#include <iostream>
#include <vector>
#include <sstream>
#include <string>

void executePostCommand(std::istringstream &iss, DataManager& dataManager) {
    std::string userId;
    // An attempt to read the userID. If there are missing parameters we ignore the input and waits for the next command
     if (!(iss >> userId)) {
        std::cout << "400 Bad Request" << std::endl;
        return;
    }
    // If the user already exists, we return a 400 Bad Request response. Otherwise, we add the user and their products to the data manager and return a 201 Created response.
    if (dataManager.userExists(userId)) {
        std::cout << "400 Bad Request" << std::endl;
    } else {
        std::vector<std::string> products;
        std::string product;
        while (iss >> product) {
            products.push_back(product);
        }
        //system update the data manager with the new user and their products, and then sends a 201 Created response to indicate that the user was successfully added.
        dataManager.addProducts(userId, products);
        std::cout << "201 Created" << std::endl;
    }
}