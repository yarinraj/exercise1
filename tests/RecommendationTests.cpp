#include <gtest/gtest.h>
#include <vector>
#include<string>
#include <utility>
#include "RecommendationLogic.h"

TEST(RecommendationLogicTest, FilterAndSortRecommendations) {
    // Arrange
    std::vector<std::pair<std::string, int>> productScores = {
       {"Laptop", 95},
        {"Old Mouse", 20},    
        {"Monitor", 80},
        {"Cheap Cable", 45}
    };
    
    // Act
    std::vector<std::string> recommendations = FilterAndSortRecommendations(productScores);
    
    // Assert
    //suppose to stay only 2 products
  ASSERT_EQ(recommendations.size(), 2);
  //the number one suppose to be the laptop because it has the highest score
    ASSERT_EQ(recommendations[0], "Laptop");
    //the number two suppose to be the monitor because it has the second highest score
    ASSERT_EQ(recommendations[1], "Monitor");


}
TEST(RecommendationLogicTest, AllProductsBelowThreshold) {
    // --- Arrange ---
    //we create a list of products with scores all below the threshold of 50
    std::vector<std::pair<std::string, int>> input = {
        {"Old Socks", 10},
        {"Broken Pen", 45},
        {"Rusty Nail", 5}
    };

    // --- Act ---
    std::vector<std::string> result = FilterAndSortRecommendations(input);

    // --- Assert ---
   //we expect that the result will be empty because all products are below the threshold of 50
    EXPECT_TRUE(result.empty());
    EXPECT_EQ(result.size(), 0);
}
TEST(RecommendationLogicTest, IdenticalScores) {
    // Arrange
    std::vector<std::pair<std::string, int>> input = {
        {"Monitor A", 80},
        {"Monitor B", 80}
    };

    // Act
    std::vector<std::string> result = FilterAndSortRecommendations(input);

    // Assert
    ASSERT_EQ(result.size(), 2);
    // Since both products have the same score, we can't guarantee their order, but both should be present
    EXPECT_TRUE(result[0] == "Monitor A" || result[0] == "Monitor B");
}