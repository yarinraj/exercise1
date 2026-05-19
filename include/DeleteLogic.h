#ifndef DELETELOGIC_H
#define DELETELOGIC_H

#include <string>
#include <vector>

// Forward declaration so the compiler knows about the DataManager class 
// without needing to include its entire header file.
class DataManager; 

// This function handles the DELETE command logic.
// It returns 'true' if the deletion was successful, 
// or 'false' if the user or any of the products do not exist (triggers 404).
bool handleDeleteCommand(const std::string& userId, const std::vector<std::string>& productIds, DataManager& dm);

#endif // DELETELOGIC_H