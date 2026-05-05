#include <iostream>
#include <sstream>
#include <string>
#include <cassert>
#include "../src/HelpCommand.h"
#include "../src/DataManager.h"

void testHelpCommand() {
    //Save the original cout buffer and redirect output to our stringstream buffer
    std::stringstream buffer;
    std::streambuf* oldCout = std::cout.rdbuf(buffer.rdbuf());

    //Execute the help command (using a 'text' DataManager for testing)
    DataManager dm("text.txt"); 
    
    //Call the help command directly, bypassing the parser
    executeHelpCommand(); 

    //Restore the original cout buffer so normal printing works again
    std::cout.rdbuf(oldCout);

    //Verify the captured output matches the exact required format
    std::string expectedOutput = 
        "add [userid] [productid1] [productid2] ...\n"
        "recommend [userid] [productid]\n"
        "help\n";
    
    assert(buffer.str() == expectedOutput);
    std::cout << "HelpCommand logic test passed!\n";
}