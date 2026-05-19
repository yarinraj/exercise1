#include <iostream>

// הצהרה על הפונקציות שלכם (כדי שהקומפיילר יכיר אותן)
void testAddCommandValid();
void testAddCommandInvalid();
void testParserRoutesToAdd();
void testParserUnknownCommand();
void DataManagerDeleteTest();
void DataManagerGetTest();
void testDataManagerLoadFromFile();
void testDataManagerNoDuplicates();
void testHelpCommand();
void testPatchExistingUserSuccess();
void testPatchUserDoesNotExist();
void testPatchMissingProducts();
void testPatchIllegalComma();
void testPostNewUserSuccess();
void testPostUserAlreadyExists();
void testPostMissingArguments();
void testPostExtraSpaces();
void testPostSpecialCharactersId();

void testReturnsMaxTenResults();



int main() {
    std::cout << "=================================" << std::endl;
    std::cout << "    STARTING ALL UNIT TESTS      " << std::endl;
    std::cout << "=================================" << std::endl;

    // הפעלת הפונקציות שלכם אחת אחת
    std::cout << "Running AddCommand Tests..." << std::endl;
    testAddCommandValid();
    testAddCommandInvalid();

    std::cout << "Running Parser Tests..." << std::endl;
    testParserRoutesToAdd();

    std::cout << "Running DataManager Tests..." << std::endl;
    testDataManagerNoDuplicates();

    std::cout << "=================================" << std::endl;
    std::cout << "    ALL TESTS COMPLETED!         " << std::endl;
    std::cout << "=================================" << std::endl;
    
    return 0;
}