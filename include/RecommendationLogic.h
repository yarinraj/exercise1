#ifndef RECOMMENDATION_LOGIC_H
#define RECOMMENDATION_LOGIC_H

#include <vector>
#include <string>
#include <utility>

// the func of ex-28:filter and sort the recommendations based on their scores
std::vector<std::string> FilterAndSortRecommendations(const std::vector<std::pair<std::string, int>>& productScores);

#endif