#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cassert>
#include "DataManager.h"
void DataManagerGetTest(){
    //create a clean testFile
    std::string testFile = "test_dm_get.txt";
    std::ofstream clearFile(testFile);
    clearFile.close();

    DataManager dm(testFile);
    //add initial product for user "3"
    std::vector<std::string> products = {"300"};
    dm.addProducts("3",products);
   
    //act for user 3 and product 300 
    std::string score = dm.getProductScore("3", "300");
    //check if the score is right(5)
    assert(score == "5");
    //if the user doesnt exist than there is an indication for 404
   std::string missing = dm.getProductScore("999", "300");
    assert(missing.empty());

    std::cout << "DataManager GET test passed!\n";
    

}
int main() {
    DataManagerGetTest();
    return 0;
}