

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#include "data.hpp"
#include <chrono>
#include <atomic>
#include <fstream>
#include <iostream>
#include "json.hpp"

// Price table with int keys - O(1) lookup
std::unordered_map<int, uint64_t> priceTable;

// Then write a function to run before your server listens:
void loadPricesFromCsv(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "[SYSTEM FATAL] Could not open configuration file: " << filename << std::endl;
        return;
    }

    std::string line;
    // Read and discard the header row: "ID,Name,Price"
    std::getline(file, line); 

    int loadedCount = 0;

    // Stream the CSV line by line
    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::stringstream ss(line);
        std::string idStr, nameStr, priceStr;

        // Parse columns separated by commas
        if (std::getline(ss, idStr, ',') && 
            std::getline(ss, nameStr, ',') && 
            std::getline(ss, priceStr, ',')) {
            
            try {
                int id = std::stoi(idStr);
                uint64_t price = std::stoull(priceStr);
                
                // Populate the hash table. Name is discarded to save RAM.
                priceTable[id] = price;
                loadedCount++;
            }
            catch (const std::exception& e) {
                std::cerr << "[DATA WARNING] Skipping malformed CSV line: " << line << std::endl;
            }
        }
    }
    
    file.close();
    std::cout << "[SYSTEM OK] Successfully loaded " << loadedCount << " products into memory." << std::endl;
}

void calculateTotals(ClientData& cd){
    cd.totalProductCount = 0;
    cd.totalMoneyCount = 0;

    for(auto& i : cd.productCount){
        auto price = priceTable.find(i.first);
        if(price != priceTable.end()){
            cd.totalProductCount += i.second;
            cd.totalMoneyCount += i.second * (*price).second;
        } // If not exist, it will skip to prevent crash.
    }
}

uint64_t generateID(){ // ID generation
    static std::atomic<uint32_t> counter{0};

    uint64_t timestamp =
        std::chrono::duration_cast<
            std::chrono::microseconds
        >(
            std::chrono::system_clock::now()
                .time_since_epoch()
        ).count();

    uint32_t seq = counter.fetch_add(1);

    return timestamp * 1000000ULL + seq;
}