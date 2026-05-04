#ifndef RECOMMENDATION_LOGIC_H
#define RECOMMENDATION_LOGIC_H

#include <vector>
#include <string>
#include <utility>

// the func of ex-28:filter and sort the recommendations based on their scores
std::vector<std::string> FilterAndSortRecommendations(std::vector<std::pair<std::string, int>>& productScores);
//claculate the similarity between two users
int CalculateSimilarity(const std::set<std::string>& userA, const std::set<std::string>& userB);
//making a score for the products: for each user check the similarity to other user for each new product we take the score of this poduct and add the similarity
std::vector<std::pair<std:: string,int>> GenerateProductScore( const std::string& targetUserId, const std::string& currntProductId,
const std::map<std::string,std::set<std::string>>& allUserData);

#endif