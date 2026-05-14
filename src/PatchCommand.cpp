#include "PatchCommand.h"
#include <vector>
#include <string>
#include <sstream>

std::string executePatchCommand(const std::string& line, std::istringstream& iss, DataManager& dataManager) {
    std::string userId;
    std::string productId;

    // 1. Syntax check: If words are separated by "," it's an illegal command
    if (line.find(',') != std::string::npos) {
        return "400 Bad Request"; 
    }
        
    // 2. Syntax check: Attempt to read userId and AT LEAST ONE productId. 
    // If missing parameters -> 400 Bad Request
    if (!(iss >> userId >> productId)) {
        return "400 Bad Request"; 
    }

    // 3. Logic check: Does the user exist? (Must be created by POST first)
    // If user does not exist -> 404 Not Found
    if (!dataManager.userExists(userId)) {
        return "404 Not Found";
    }
        
    // If we reached here, the command is valid and the user exists.
    std::vector<std::string> products;
    products.push_back(productId);
        
    // Reading the rest of the products, if there are any.
    while (iss >> productId) {
        products.push_back(productId);
    }

    // Update the database
    dataManager.addProducts(userId, products);

    // 4. Success -> 204 No Content
    return "204 No Content";
}