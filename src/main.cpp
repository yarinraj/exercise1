#include <iostream>
#include "CommandParser.h"
#include <string>
#include "DataManager.h"

int main() {
    DataManager dataManager("../data/database.txt");
    std::string line;
    
    //a loop that runs forever , wating for an input line
    while (true) {
        std::getline(std::cin, line);
        
        //if the input is empty , the program continues
        if (line.empty()) {
            continue;
        }
        
        parseCommand(line, dataManager);
    }
    
    return 0;
}