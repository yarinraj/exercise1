//testing the help command

#include <iostream>
#include <sstream>
#include <cassert>
#include "CommandParser.h"

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