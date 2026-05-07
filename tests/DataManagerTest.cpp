#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cassert>
#include "DataManager.h"

void testDataManagerNoDuplicates() {
    //Create a clean test file
    std::string testFile = "test_dm_duplicates.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();

    DataManager dm(testFile);
    
    //Add initial products for user "1"
    std::vector<std::string> batch1 = {"100", "101"};
    dm.addProducts("1", batch1);

    //Add a second batch where "101" is a duplicate
    std::vector<std::string> batch2 = {"101", "102"}; 
    dm.addProducts("1", batch2);

    //Verify file content
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();

    // The duplicate "101" should be ignored
    assert(savedLine == "1 100, 101, 102");
    std::cout << "DataManager No Duplicates test passed!\n";
}

void testDataManagerLoadFromFile() {
    std::string testFile = "test_dm_load.txt";
    
    //Pre-populate a file with existing user data
    std::ofstream outFile(testFile);
    outFile << "2 200, 201\n";
    outFile.close();

    //Initialize DataManager - it must load the existing data from the file automatically
    DataManager dm(testFile);

    //Add a new product to the existing user
    std::vector<std::string> newProducts = {"202"};
    dm.addProducts("2", newProducts);

    //Verify file content includes both old and new data
    std::ifstream inFile(testFile);
    std::string savedLine;
    std::getline(inFile, savedLine);
    inFile.close();

    //The output should contain the loaded products and the new one
    assert(savedLine == "2 200, 201, 202");
    std::cout << "DataManager Load From File test passed!\n";
}