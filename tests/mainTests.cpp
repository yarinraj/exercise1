#include <iostream>

void testAddCommandValid();
void testAddCommandInvalid();
void testParserRoutesToAdd();
void testParserUnknownCommand();
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
void testTieBreakerByProductId();
void testSortsByRelevanceDescending();
void runDeleteTests();
void runGetTests();

int main() {
    std::cout << "=================================" << std::endl;
    std::cout << "    STARTING ALL UNIT TESTS      " << std::endl;
    std::cout << "=================================" << std::endl;

    testAddCommandValid();
    testAddCommandInvalid();
    testParserRoutesToAdd();
    testParserUnknownCommand();
    testDataManagerLoadFromFile();
    testDataManagerNoDuplicates();
    testHelpCommand();
    testPatchExistingUserSuccess();
    testPatchUserDoesNotExist();
    testPatchMissingProducts();
    testPatchIllegalComma();
    testPostNewUserSuccess();
    testPostUserAlreadyExists();
    testPostMissingArguments();
    testPostExtraSpaces();
    testPostSpecialCharactersId();
    testReturnsMaxTenResults();
    testTieBreakerByProductId();
    testSortsByRelevanceDescending();
    runDeleteTests();
    runGetTests();

    std::cout << "=================================" << std::endl;
    std::cout << "    ALL TESTS COMPLETED!         " << std::endl;
    std::cout << "=================================" << std::endl;
    
    return 0;
}