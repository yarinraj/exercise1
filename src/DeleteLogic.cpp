#include "DeleteLogic.h"
#include "DataManager.h"
#include <string>
#include <vector>

bool handleDeleteCommand(const std::string& userId, const std::vector<std::string>& productIds, DataManager& dm) {
    // 1. Retrieve the formatted data from the DataManager to perform validations
    auto allUserData = dm.getFormattedData();
    
    // Edge Case 1: Check if the user exists in the system
    if (allUserData.find(userId) == allUserData.end()) {
        return false; // User does not exist, return false
    }

    // Edge Case 2: Check if *all* requested products actually belong to the user
    // We create a copy of the user's product set to perform checks without modifying the original data.
    auto userProducts = allUserData.at(userId); 
    
    for (const auto& productId : productIds) {
        if (userProducts.count(productId) == 0) {
            return false; // If even one product is missing (or already checked), the entire deletion fails
        }
        // delete from copy set, if we delete more than one time this should fail and we return 404.
        userProducts.erase(productId); 
    }

    // 2. If we reached this point - everything is valid! We can perform the actual deletion.
    // We iterate through the list of products and tell the DataManager to remove them one by one.
    for (const auto& productId : productIds) {
        dm.removeSingleProduct(userId, productId);
    }

    return true; // Deletion completed successfully!
}