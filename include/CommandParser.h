#ifndef COMMAND_PARSER_HPP
#define COMMAND_PARSER_HPP

#include <string>
#include "DataManager.h"

void parseCommand(const std::string& line, DataManager& dataManager);

#endif