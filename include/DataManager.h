#ifndef DATA_MANAGER_HPP
#define DATA_MANAGER_HPP

#include <string>
#include <vector>
#include <map>
#include<set>

class DataManager {
private:
    //Our dictionary: mapping between the userID and his prosucts
    std::map<std::string, std::vector<std::string>> usersProducts;
    
    //The file name of the data file that will save all the users data
    std::string filename;

public:
    // Loads the info from the data file
    DataManager(const std::string& file);

    //Adding products function
    void addProducts(const std::string& userId, const std::vector<std::string>& products);

    //Aoutomatic saving data to file and pulling it
    void saveToFile() const;
    void loadFromFile();
    // get func
    std::map<std::string, std::set<std::string>> getFormattedData() const;
};

#endif