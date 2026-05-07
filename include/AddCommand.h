#pragma once
#include <string>
#include <sstream>
#include "DataManager.h"

void executeAddCommand(const std::string& line, std::istringstream& iss, DataManager& dataManager);