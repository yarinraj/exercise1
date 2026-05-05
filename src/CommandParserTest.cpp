#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <cassert>
#include "CommandParser.h"
#include "DataManager.h"

//Testing the add command

// Test 1: Valid add command with multiple products
void testAddCommandValid() {
    //Create a clean, empty dummy database file for this test
    std::string testFile = "test_parser_add_valid.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    //Initialize DataManager with the test file
    DataManager dm(testFile);
    
    //Execute a valid add command via the parser (1 user, 3 products)
    std::string commandLine = "add 99 500 501";
    parseCommand(commandLine, dm);
    
    //Open the file to verify the parser correctly passed the data to DataManager
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    //Verify the output format (matching the DataManager's logic: "userId productId, productId")
    assert(savedLine == "99 500, 501");
    std::cout << "CommandParser Valid Add test passed!\n";
}

// Test 2: Invalid add command (missing product ID)
void testAddCommandInvalid() {
    //Create a clean dummy database file
    std::string testFile = "test_parser_add_invalid.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();
    
    DataManager dm(testFile);
    
    //Execute an invalid command (missing the product ID completely)
    std::string commandLine = "add 99";
    parseCommand(commandLine, dm);
    
    //Open the file to verify nothing was saved
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();
    
    //The line should be empty because the parser should ignore invalid commands
    assert(savedLine.empty());
    std::cout << "CommandParser Invalid Add test passed!\n";
}

//Testing the help command

void testHelpCommand() {
    // 1. Save the original cout buffer and redirect output to our stringstream buffer
    std::stringstream buffer;
    std::streambuf* oldCout = std::cout.rdbuf(buffer.rdbuf());

    // 2. Execute the help command (using a 'text' DataManager for testing)
    DataManager dm("text.txt"); 
    parseCommand("help", dm);

    // 3. Restore the original cout buffer so normal printing works again
    std::cout.rdbuf(oldCout);

    // 4. Verify the captured output matches the exact required format
    std::string expectedOutput = 
        "add [userid] [productid1] [productid2] ...\n"
        "recommend [userid] [productid]\n"
        "help\n";
    
    assert(buffer.str() == expectedOutput);
    std::cout << "Help command test passed!\n";
}

//testing the add command