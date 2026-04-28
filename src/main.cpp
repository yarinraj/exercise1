#include <iostream>
#include "CommandParser.h"
#include <string>

int main() {
    std::string line;
    
    //a loop that runs forever , wating for an input line
    while (true) {
        std::getline(std::cin, line);
        
        //if the input is empty , the program continues
        if (line.empty()) {
            continue;
        }
        
        // כאן נכנסת הקריאה לפונקציית הפארסר שלך
        parseCommand(line);
    }
    
    return 0;
}