#include "DataManager.h"
#include "RecommendationLogic.h" // The file where handleGetCommand is implemented
#include <iostream>
#include <cassert>
#include <fstream>
#include <vector>
#include <string>

// Declaration of the external GET command function (if not already in RecommendationLogic.h)
// std::string handleGetCommand(const std::string& userId, const std::string& productId, DataManager& dm);

void DataManagerGetTest() {

    // 1. ARRANGE: Setting up a clean environment

    std::string testFile = "test_dm_get_recommend.txt";
    
    // Create and immediately close to clear any previous data
    std::ofstream clearFile(testFile);
    clearFile.close();

    DataManager dm(testFile);

    // Mocking database data for the collaborative filtering algorithm:
    
    // Target user (user "3") bought products "100" and "200"
    dm.addProducts("3", {"100", "200"});
    
    // User "4" bought "100", "200" and "300". 
    // Similarity to user "3" is 2 (shares "100" and "200"). 
    // Therefore, product "300" gets an algorithmic score of 2.
    dm.addProducts("4", {"100", "200", "300"});
    
    // User "5" bought "100" and "400".
    // Similarity to user "3" is 1 (shares only "100"). 
    // Therefore, product "400" gets an algorithmic score of 1.
    dm.addProducts("5", {"100", "400"});


    // 2. ACT: Executing the GET command
  
    // We pass the DataManager reference to the external handler function
    std::string recommendations = executeGetCommand("3", "100", dm);

   
    // 3. ASSERT: Checking the expected outcome

    // The algorithm should filter and sort from highest score to lowest. 
    // Product "300" (score 2) must appear before product "400" (score 1).
    assert(recommendations == "300 400");

    // TDD Edge Cases (Expected to trigger 404 Not Found in the parser)
  
    
    // Edge Case 1: Target user does not exist in the system
    std::string missingUser = executeGetCommand("999", "100", dm);
    assert(missingUser.empty());

    // Edge Case 2: Target product does not exist for the target user
    std::string missingProduct = executeGetCommand("3", "999", dm);
    assert(missingProduct.empty());

    std::cout << "DataManager GET (Recommendation Logic) test passed!\n";
}

int main() {
    DataManagerGetTest();
    return 0;