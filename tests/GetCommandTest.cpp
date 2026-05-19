#include "DataManager.h"
#include "GetCommand.h"
#include "RecommendationLogic.h"
#include <iostream>
#include <cassert>
#include <fstream>
#include <vector>
#include <string>

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


    // 2. ACT: Executing the recommendation logic directly
  
    // We pass the parameters directly to the algorithm
    std::vector<std::string> recommendations = RecommendationLogic::getRecommendations("3", "100", dm.getFormattedData());

   
    // 3. ASSERT: Checking the expected outcome

    // The algorithm should filter and sort from highest score to lowest. 
    // We expect 2 products: "300" first, then "400".
    assert(recommendations.size() == 2);
    assert(recommendations[0] == "300");
    assert(recommendations[1] == "400");

    // TDD Edge Cases (Testing data validation)
  
    // Edge Case 1: Target user does not exist in the system
    assert(dm.userExists("999") == false);

    // Edge Case 2: Target product does not exist for the target user
    std::vector<std::string> missingProduct = RecommendationLogic::getRecommendations("3", "999", dm.getFormattedData());
    assert(missingProduct.empty());

    std::cout << "DataManager GET (Recommendation Logic) test passed!\n";
}

void runGetTests() {
    DataManagerGetTest();
}