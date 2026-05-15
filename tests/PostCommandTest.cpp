#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <fstream>
#include "../include/DataManager.h" 
#include "CommandParser.h"
// Test cases for POST command
// Each test case will create a new instance of DataManager with a test database file to ensure isolation between tests.

// to compile: g++ -std=c++17 -I include \
tests/PostCommandTest.cpp \
src/DataManager.cpp \
src/CommandParser.cpp \
src/AddCommand.cpp \
src/HelpCommand.cpp \
src/RecommendationLogic.cpp \
-o post_tests

//to run: ./post_tests

// Test case 1: Successfully adding a new user with valid ID and products
void testPostNewUserSuccess() {
    std::cout << "Running: testPostNewUserSuccess..." << std::endl;

    //empty the test database before running the test
    std::string testFile = "test_db.txt";
    std::ofstream ofs(testFile, std::ios::trunc); 
    ofs.close();

    DataManager dm(testFile);

    // adding a new user with ID 105 and some data
    std::string command = "POST 105 10 20";
    parseCommand(command, dm);

    // verify that the user was actually added
    assert(dm.userExists("105") == true); 

    std::cout << "testPostNewUserSuccess PASSED!" << std::endl;
}
// Test case 2: Attempting to add a user that already exists (should handle gracefully)
void testPostUserAlreadyExists() {
    std::cout << "Running: testPostUserAlreadyExists..." << std::endl;

    // Setup - Create a DataManager and add a user
    DataManager dm("test_db.txt");
    dm.addProducts("100", {"1", "2", "3"}); 

    // Execute - Try to add the same user again with different data
    std::string command = "POST 100 9 8 7";
    parseCommand(command, dm);
    
    std::cout << "testPostUserAlreadyExists PASSED!" << std::endl;
}
// Test case 3: Missing arguments (should handle gracefully and not add a user)
void testPostMissingArguments() {
    std::cout << "Running: testPostMissingArguments..." << std::endl;
    DataManager dm("test_db.txt");

    // command without ID and products
    std::string command = "POST";
    parseCommand(command, dm); 

    // command with ID but no products
    std::string command2 = "POST 106";
    parseCommand(command2, dm);

    // make sure that no user was added
    assert(dm.userExists("106") == false);
    std::cout << "testPostMissingArguments PASSED!" << std::endl;
}
// Test case 4: Extra spaces in the command (should still parse correctly)
void testPostExtraSpaces() {
    std::cout << "Running: testPostExtraSpaces..." << std::endl;
    DataManager dm("test_db.txt");

    // command with extra spaces
    std::string command = "POST   107    50   60  ";
    parseCommand(command, dm);

    assert(dm.userExists("107") == true);
    // if you have a way to check the number of products, it's good to verify there are exactly 2 (50 and 60)
    std::cout << "testPostExtraSpaces PASSED!" << std::endl;
}
// Test case 5: Special characters in ID (should handle gracefully and add the user)
void testPostSpecialCharactersId() {
    std::cout << "Running: testPostSpecialCharactersId..." << std::endl;
    DataManager dm("test_db.txt");

    std::string command = "POST user_abc! 10 20";
    parseCommand(command, dm);

    assert(dm.userExists("user_abc!") == true);
    std::cout << "testPostSpecialCharactersId PASSED!" << std::endl;
}
// Main function to run all tests
int main() {
    try {
        testPostNewUserSuccess();
        testPostUserAlreadyExists();
        testPostMissingArguments();
        testPostExtraSpaces();
        testPostSpecialCharactersId();
        std::cout << "\nALL TESTS PASSED!" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Test failed with error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}