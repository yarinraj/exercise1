#include <gtest/gtest.h>
#include <vector>
#include<string>
#include <utility>
#include "RecommendationLogic.h"

// Test Case 1: Ensure the system limits recommendations to a maximum of 10 products.
TEST(RecommendationLogicTest, ReturnsMaxTenResults) {
    std::vector<std::pair<std::string, int>> input;
    // Fill with 15 products to test the upper limit
    
    for (int i = 1; i <= 15; ++i) {
        input.push_back({"Product" + std::to_string(i), i});
    }

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    // Requirement: System must provide up to 10 recommendations.
    EXPECT_LE(result.size(), 10);
}

// Test Case 2: Verify tie-breaking logic (identical scores -> sort by product ID ascending)[cite: 1].
TEST(RecommendationLogicTest, TieBreakerByProductId) {
    // Two products with identical relevance scores
    std::vector<std::pair<std::string, int>> input = {
        {"200", 10},
        {"100", 10}
    };

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    ASSERT_EQ(result.size(), 2);
    // Requirement: When scores are equal, return in ascending ID order[cite: 1].
    EXPECT_EQ(result[0], "100");
    EXPECT_EQ(result[1], "200");
}

// Test Case 3: Verify sorting logic (highest relevance score first)[cite: 1].
TEST(RecommendationLogicTest, SortsByRelevanceDescending) {
    std::vector<std::pair<std::string, int>> input = {
        {"ProductA", 5},
        {"ProductB", 20},
        {"ProductC", 10}
    };

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    ASSERT_EQ(result.size(), 3);
    // Requirement: Recommendations should be sorted by total relevance score descending[cite: 1].
    EXPECT_EQ(result[0], "ProductB"); // Score: 20
    EXPECT_EQ(result[1], "ProductC"); // Score: 10
    EXPECT_EQ(result[2], "ProductA"); // Score: 5
}