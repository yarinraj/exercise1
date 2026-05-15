#ifndef PATCHCOMMAND_H
#define PATCHCOMMAND_H

#include <string>
#include <sstream>
#include "DataManager.h"

/**
 * Executes the PATCH command.
 * Adds products to an existing user.
 * * Returns HTTP-like status codes:
 * - "204 No Content" on success.
 * - "404 Not Found" if the user does not exist.
 * - "400 Bad Request" on invalid syntax or missing parameters.
 */
std::string executePatchCommand(const std::string& line, std::istringstream& iss, DataManager& dataManager);

#endif // PATCHCOMMAND_H