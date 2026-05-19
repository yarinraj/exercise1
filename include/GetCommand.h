#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "DataManager.h"
#include <string>
#include <sstream>

// get command function declaration
void executeGetCommand(std::istringstream& iss, DataManager& dataManager);

#endif