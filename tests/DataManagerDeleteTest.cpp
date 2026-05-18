
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cassert>
#include "DataManager.h"
void DataManagerDeleteTest() {
//create a clean test file 
std::string testFile = "test_dm_delete.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();

    DataManager dm(testFile);
    //add a user with products
    std::vector<std::string>products = {"400","401"};
    dm.addProducts("4",products);
//try delete user product 400 
std::vector<std::string> toDelete = {"400"};
        dm.deleteProducts("4", toDelete);

//check in the database that 400 is deleted 
std::ifstream inFile(testFile);
std::string line;
bool found400=false;
while (std::getline(inFile, line)) {
        if (line.find("400") != std::string::npos) {
            found400 = true; // if found the delete failed
        }
    }
    inFile.close();
    assert(!found400);
    std::cout<<"DataManager DELETE test passed!\n";

}
int main() {
    DataManagerDeleteTest();
    return 0;
}