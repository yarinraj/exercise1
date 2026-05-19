#include "DeleteLogic.h"
#include "DataManager.h"
#include <string>
#include <vector>

bool handleDeleteCommand(const std::string& userId, const std::vector<std::string>& productIds, DataManager& dm) {
    // 1. Retrieve the formatted data from the DataManager to perform validations
    auto allUserData = dm.getFormattedData();
    
    // Edge Case 1: Check if the user exists in the system
    if (allUserData.find(userId) == allUserData.end()) {
        return false; // User does not exist, return false (Parser will send 404)
    }

    // Edge Case 2: Check if *all* requested products actually belong to the user
    const auto& userProducts = allUserData.at(userId);
    for (const auto& productId : productIds) {
        if (userProducts.count(productId) == 0) {
            return false; // If even one product is missing, the entire deletion fails
        }
    }

    // 2. If we reached this point - everything is valid! We can perform the actual deletion.
    // We iterate through the list of products and tell the DataManager to remove them one by one.
    for (const auto& productId : productIds) {
        dm.removeSingleProduct(userId, productId);
    }

    return true; // Deletion completed successfully! (Parser will send 200 OK)
}