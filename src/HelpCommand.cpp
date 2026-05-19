#include <iostream>
#include "HelpCommand.h"
#include <map>
#include <string>
void executeHelpCommand(){
std::map<std::string, std::string> sortedCommands = {
        {"DELETE", "DELETE, arguments: [userid] [productid1] [productid2] ..."},
        {"GET",    "GET, arguments: [userid] [productid]"},
        {"PATCH",  "PATCH, arguments: [userid] [productid1] [productid2] ..."},
        {"POST",   "POST, arguments: [userid] [productid1] [productid2] ..."} 
    };
    // alphabetical order of the commands (except for help which is always last)
    for (const auto& [command, outputLine] : sortedCommands) {
        std::cout << outputLine << std::endl;
    }

    std::cout << "help" << std::endl;
}