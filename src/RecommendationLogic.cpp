#include "RecommendationLogic.h"
#include <algorithm>
#include <vector>
#include <string>
#include<map>
#include<set>
namespace RecommendationLogic { 

    int CalculateSimilarity(const std::set<std::string>& userA, const std::set<std::string>& userB) {
        int count = 0;
        for (const auto& prod : userA) {
            if (userB.count(prod)) {
                count++;
            }
        }
        return count;
    }

    std::vector<std::pair<std::string, int>> GenerateProductScore(const std::string& targetUserId, const std::string& currentProductId, const std::map<std::string, std::set<std::string>>& allUserData) {
        std::map<std::string, int> score;
        if (allUserData.find(targetUserId) == allUserData.end()) return {};
        
        const auto& targetUserProducts = allUserData.at(targetUserId);
        
        for (const auto& [otherUserId, otherProduct] : allUserData) {
            if (otherUserId == targetUserId) continue;

            if (otherProduct.count(currentProductId)) {
                int similarity = CalculateSimilarity(targetUserProducts, otherProduct);
                for (const auto& otherProdId : otherProduct) {
                    if (otherProdId != currentProductId && !targetUserProducts.count(otherProdId)) {
                        score[otherProdId] += similarity;
                    }
                }
            }
        }
        return std::vector<std::pair<std::string, int>>(score.begin(), score.end());
    }

    std::vector<std::string> FilterAndSortRecommendations(std::vector<std::pair<std::string, int>>& productScores) {
        std::sort(productScores.begin(), productScores.end(), [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) return a.second > b.second;
            return a.first < b.first;
        });

        size_t numToReturn = std::min(productScores.size(), static_cast<size_t>(10));
        std::vector<std::string> finalRecommendations;
        for (size_t i = 0; i < numToReturn; ++i) {
            finalRecommendations.push_back(productScores[i].first);
        }
        return finalRecommendations;
    }

    std::vector<std::string> getRecommendations(const std::string& userId, const std::string& productId, const std::map<std::string, std::set<std::string>>& allUserData) {
        std::vector<std::pair<std::string, int>> productScores = GenerateProductScore(userId, productId, allUserData);
        return FilterAndSortRecommendations(productScores);
    }
}