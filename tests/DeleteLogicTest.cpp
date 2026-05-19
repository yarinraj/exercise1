#include "DataManager.h"
#include "DeleteLogic.h"
#include <iostream>
#include <cassert>
#include <fstream>
#include <vector>
#include <string>

void DeleteLogicTest() {
    
    // 1. ARRANGE: Setting up a clean environment
   
    std::string testFile = "test_dm_delete.txt";
    
    // Clear any existing data in the test file
    std::ofstream clearFile(testFile);
    clearFile.close();

    DataManager dm(testFile);

    // Add initial data for the test: User "3" has products "100" and "200"
    dm.addProducts("3", {"100", "200"});

   
    // 2. ACT & ASSERT: Testing Edge Cases (404)
    
    std::vector<std::string> validProduct = {"100"};
    std::vector<std::string> missingProduct = {"999"};
    
    // Edge Case 1: Target user does not exist in the system
    bool missingUserResult = handleDeleteCommand("999", validProduct, dm);
    assert(missingUserResult == false);

    // Edge Case 2: Target product does not exist for the user
    bool missingProductResult = handleDeleteCommand("3", missingProduct, dm);
    assert(missingProductResult == false);

  
    // 3. ACT: Executing a successful DELETE command

    // Delete product "100" from user "3"
    bool successResult = handleDeleteCommand("3", validProduct, dm);
    
    // The function should return true for a successful deletion
    assert(successResult == true);


    // 4. ASSERT: Verifying the data was actually modified

    auto allUserData = dm.getFormattedData();
    
    // Product "100" should be completely removed from user "3"
    assert(allUserData.at("3").count("100") == 0);
    
    // Product "200" should remain untouched
    assert(allUserData.at("3").count("200") == 1);

    std::cout << "DELETE command logic test passed!\n";
}

int main() {
    DeleteLogicTest();
    return 0;
}