#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <cassert>
#include "../src/AddCommand.h"
#include "../src/DataManager.h"

// Test 1: Valid add command logic
void testAddCommandValid() {
    std::string testFile = "test_add_logic_valid.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    DataManager dm(testFile);
    std::string line = "add 99 500 501";
    std::istringstream iss(line);
    
    std::string dummyCommand;
    // Skip the first word ("add") just like the parser would
    iss >> dummyCommand; 
    
    executeAddCommand(line, iss, dm);
    
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    assert(savedLine == "99 500, 501");
    std::cout << "AddCommand Logic Valid test passed!\n";
}

// Test 2: Invalid add command logic (missing product ID)
void testAddCommandInvalid() {
    std::string testFile = "test_add_logic_invalid.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    DataManager dm(testFile);
    std::string line = "add 99";
    std::istringstream iss(line);
    
    std::string dummyCommand;
    // Skip the first word
    iss >> dummyCommand;
    
    executeAddCommand(line, iss, dm);
    
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    assert(savedLine.empty());
    std::cout << "AddCommand Logic Invalid test passed!\n";
}