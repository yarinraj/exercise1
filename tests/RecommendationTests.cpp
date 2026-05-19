#include <iostream>
#include <vector>
#include <string>
#include <utility>
#include <cassert>
#include "RecommendationLogic.h"

/**
 * Test Case 1: Ensure the system limits recommendations to a maximum of 10 products[cite: 38].
 */
void testReturnsMaxTenResults() {
    std::vector<std::pair<std::string, int>> input;
    // Fill with 15 products to test the upper limit
    for (int i = 1; i <= 15; ++i) {
        input.push_back({"Product" + std::to_string(i), i});
    }

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    // Requirement: System must provide up to 10 recommendations[cite: 38].
    assert(result.size() <= 10);
    std::cout << "Test ReturnsMaxTenResults: PASSED" << std::endl;
}

/**
 * Test Case 2: Verify tie-breaking logic (identical scores -> sort by product ID ascending)[cite: 124].
 */
void testTieBreakerByProductId() {
    // Two products with identical relevance scores
    std::vector<std::pair<std::string, int>> input = {
        {"200", 10},
        {"100", 10}
    };

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    assert(result.size() == 2);
    // Requirement: When scores are equal, return in ascending ID order[cite: 124].
    assert(result[0] == "100");
    assert(result[1] == "200");
    std::cout << "Test TieBreakerByProductId: PASSED" << std::endl;
}


 //Test Case 3: Verify sorting logic (highest relevance score first)[cite: 123, 124].

void testSortsByRelevanceDescending() {
    std::vector<std::pair<std::string, int>> input = {
        {"ProductA", 5},
        {"ProductB", 20},
        {"ProductC", 10}
    };

    std::vector<std::string> result = FilterAndSortRecommendations(input);

    assert(result.size() == 3);
    // Requirement: Recommendations should be sorted by total relevance score descending[cite: 123, 124].
    assert(result[0] == "ProductB"); // Score: 20
    assert(result[1] == "ProductC"); // Score: 10
    assert(result[2] == "ProductA"); // Score: 5
    std::cout << "Test SortsByRelevanceDescending: PASSED" << std::endl;
}