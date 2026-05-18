#include "DataManager.h"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <set>
#include <map>

//Constructor that loads the data from the data file 
DataManager::DataManager(const std::string& file) : filename(file) {
    loadFromFile();
}
//get function

std::map<std::string, std::set<std::string>> DataManager::getFormattedData() const {
    std::map<std::string, std::set<std::string>> formatted;

    for (const auto& [user, products] : usersProducts){
        formatted[user]=std::set<std::string>(products.begin(),products.end());
    }
    return formatted;
}

//Add function
void DataManager::addProducts(const std::string& userId, const std::vector<std::string>& products) {
    for (const auto& product : products) {
        if (std::find(usersProducts[userId].begin(), usersProducts[userId].end(), product) == usersProducts[userId].end()) {
            usersProducts[userId].push_back(product);
        }
    }
    saveToFile(); 
}

//Loads the data from data file to the usersProducts
void DataManager::loadFromFile() {
    std::ifstream inFile(filename);
    if (!inFile.is_open()) return; 

    std::string line;
    while (std::getline(inFile, line)) {
        if (line.empty()) continue;

        //switch each "," from the data file with " "
        for (char& c : line) {
            if (c == ',') {
                c = ' ';
            }
        }

        std::istringstream iss(line);
        std::string userId, productId;
        
        if (iss >> userId) {
            while (iss >> productId) {
                if(std::find(usersProducts[userId].begin(), usersProducts[userId].end(), productId) == usersProducts[userId].end()) {
                    usersProducts[userId].push_back(productId);
                }
            }
        }
    }
    inFile.close();
}

//Saving the data from the usersProducts to the data file 
void DataManager::saveToFile() const {
    std::ofstream outFile(filename);
    if (!outFile.is_open()) return;

    for (const auto& pair : usersProducts) {
        const std::string& userId = pair.first;
        const std::vector<std::string>& products = pair.second;
        
        outFile << userId << " ";
        
        for (size_t i = 0; i < products.size(); ++i) {
            outFile << products[i];
            if (i < products.size() - 1) {
                outFile << ", ";
            }
        }
        outFile << "\n";
    }
   
    
    outFile.close();
}

//func to delete a product
void DataManager::deleteProducts(const std::string& userId, const std::vector<std::string>& productIds) {
    //searching the user of the product
    auto it = usersProducts.find(userId);
    //if found will deal with his product
    if (it!=usersProducts.end()){
        //link to his products
        auto& userProducts=it->second;
        //going threw the all of the products we got in the erased list.
        for(const auto& productId:productIds){
            userProducts.erase(std::remove(userProducts.begin(),userProducts.end(),productId),userProducts.end());

        }
        saveToFile();
    }

}

//Helper function to check if a user exists
bool DataManager::userExists(const std::string& userId) const {
    // Check if the userId exists in the usersProducts map
    return usersProducts.find(userId) != usersProducts.end();
}