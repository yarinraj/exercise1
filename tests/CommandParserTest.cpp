#include <iostream>
#include <fstream>
#include <string>
#include <cassert>
#include "../src/CommandParser.h"
#include "../src/DataManager.h"

// Test 1: Verify the parser correctly routes the "add" command
void testParserRoutesToAdd() {
    std::string testFile = "test_parser_route.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    DataManager dm(testFile);
    
    // Testing if the parser recognizes 'add' and calls the appropriate logic
    parseCommand("add 100 200", dm);
    
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    // If this passes, it means the parser successfully routed the call
    assert(savedLine == "100 200");
    std::cout << "CommandParser Route Add test passed!\n";
}

// Test 2: Verify the parser ignores invalid/unknown commands
void testParserUnknownCommand() {
    std::string testFile = "test_parser_unknown.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    DataManager dm(testFile);
    
    // Sending a command that the system shouldn't recognize
    parseCommand("invalidCommand 123 456", dm);
    
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    // The file should remain empty
    assert(savedLine.empty());
    std::cout << "CommandParser Unknown Command test passed!\n";
}