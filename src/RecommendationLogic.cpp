#include "RecommendationLogic.h"
#include <algorithm>
#include <vector>
#include <string>
#include<map>
#include<set>

int CalculateSimilarity(const std::set<std::string>& userA, const std::set<std::string>& userB){
    int count=0;
    for(const auto& prod : userA)
    {
        if(userB.count(prod)){
            count++;
        }
    }
    return count;
}

std::vector<std::pair<std:: string,int>> GenerateProductScore( const std::string& targetUserId, const std::string& currntProductId,
const std::map<std::string,std::set<std::string>>& allUserData){
    std::map<std::string,int> score;
    //check if the user in database
    if(allUserData.find(targetUserId)==allUserData.end())
    return{};
    const auto& targetUserProducts=allUserData.at(targetUserId);
    //going though all of the users
    for(const auto& [otherUserId, otherProduct]:allUserData){
        //dont check the user itself
        if(otherUserId==targetUserId)
        {
            continue;
        }
        //check the similarity of the products
        if(otherProduct.count(currntProductId)){
            int similarity= CalculateSimilarity(targetUserProducts, otherProduct);
        
            for(const auto& otherProdId:otherProduct)
               {
                  if(otherProdId!=currntProductId&&!targetUserProducts.count(otherProdId)){
                  score[otherProdId]+=similarity;
                }
          }
      }

    }

return std::vector<std::pair<std::string,int>>(score.begin(),score.end());

}




std::vector<std::string> FilterAndSortRecommendations(std::vector<std::pair<std::string, int>>& productScores) {
        // 1. Sorting logic based on the assignment appendix
   std:: sort(productScores.begin(), productScores.end(), [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
    if(a.second != b.second) {
        return a.second > b.second; // If scores are equal, sort alphabetically
    }
    return a.first < b.first;
    });
    // 2. Limit to a maximum of 10 recommendations
    size_t numToReturn = std::min(productScores.size(), static_cast<size_t>(10));
    std:: vector<std::string> finalRecommendations;
    for(size_t i = 0; i < numToReturn; ++i) {
        finalRecommendations.push_back(productScores[i].first);
    }
    return finalRecommendations;
    
   
}