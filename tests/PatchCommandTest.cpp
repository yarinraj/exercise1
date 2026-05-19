#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include "../include/DataManager.h" 
#include "../include/PatchCommand.h" 

// Helper function to create a clean database for each test
void clearTestDB(const std::string& filename) {
    std::ofstream ofs(filename, std::ios::trunc);
    ofs.close();
}

// Test 1: Valid PATCH command for an existing user -> Should return 204
void testPatchExistingUserSuccess() {
    std::cout << "Running: testPatchExistingUserSuccess..." << std::endl;
    std::string testFile = "test_patch_db.txt";
    clearTestDB(testFile);
    DataManager dm(testFile);
    
    // Setup: Simulate a prior POST
    dm.addProducts("100", {"prod1", "prod2"});
    
    // Execute PATCH
    std::string line = "PATCH 100 prod3 prod4";
    std::istringstream iss(line);
    std::string commandName;
    iss >> commandName; // Extract "PATCH"
    
    std::string response = executePatchCommand(line, iss, dm);
    
    // Assertions for Client Response
    assert(response == "204 No Content");
    
    // Assertions for Database Integrity 
    assert(dm.userExists("100") == true);
    
    std::map<std::string, std::set<std::string>> allData = dm.getFormattedData();
    // Verify that prod3 and prod4 were actually added to user 100's set
    assert(allData["100"].count("prod3") == 1);
    assert(allData["100"].count("prod4") == 1);
    
    std::cout << "testPatchExistingUserSuccess PASSED!\n" << std::endl;
}

// Test 2: PATCH command for a user that DOES NOT exist -> Should return 404
void testPatchUserDoesNotExist() {
    std::cout << "Running: testPatchUserDoesNotExist..." << std::endl;
    std::string testFile = "test_patch_db.txt";
    clearTestDB(testFile);
    DataManager dm(testFile);
    // Database is empty, no users exist.

    std::string line = "PATCH 200 prod1";
    std::istringstream iss(line);
    std::string commandName;
    iss >> commandName; // Extract "PATCH"
    
    std::string response = executePatchCommand(line, iss, dm);
    
    // Assertions
    assert(response == "404 Not Found");
    // Ensure user wasn't accidentally created
    assert(dm.userExists("200") == false); 
    
    std::cout << "testPatchUserDoesNotExist PASSED!\n" << std::endl;
}

// Test 3: Missing parameters (no products) -> Should return 400
void testPatchMissingProducts() {
    std::cout << "Running: testPatchMissingProducts..." << std::endl;
    std::string testFile = "test_patch_db.txt";
    clearTestDB(testFile);
    DataManager dm(testFile);
    
    // User exists
    dm.addProducts("300", {"prod1"});

    std::string line = "PATCH 300"; // Missing products!
    std::istringstream iss(line);
    std::string commandName;
    iss >> commandName; 
    
    std::string response = executePatchCommand(line, iss, dm);
    
    assert(response == "400 Bad Request");
    
    std::cout << "testPatchMissingProducts PASSED!\n" << std::endl;
}

// Test 4: Missing parameters (no ID and no products) -> Should return 400
void testPatchMissingIdAndProducts() {
    std::cout << "Running: testPatchMissingIdAndProducts..." << std::endl;
    std::string testFile = "test_patch_db.txt";
    clearTestDB(testFile);
    DataManager dm(testFile);

    std::string line = "PATCH"; 
    std::istringstream iss(line);
    std::string commandName;
    iss >> commandName; 
    
    std::string response = executePatchCommand(line, iss, dm);
    
    assert(response == "400 Bad Request");
    
    std::cout << "testPatchMissingIdAndProducts PASSED!\n" << std::endl;
}

// Test 5: Illegal syntax (contains comma) -> Should return 400
void testPatchIllegalComma() {
    std::cout << "Running: testPatchIllegalComma..." << std::endl;
    std::string testFile = "test_patch_db.txt";
    clearTestDB(testFile);
    DataManager dm(testFile);
    
    dm.addProducts("400", {"prod1"});

    std::string line = "PATCH 400, prod2"; 
    std::istringstream iss(line);
    std::string commandName;
    iss >> commandName; 
    
    std::string response = executePatchCommand(line, iss, dm);
    
    assert(response == "400 Bad Request");
    
    std::cout << "testPatchIllegalComma PASSED!\n" << std::endl;
}