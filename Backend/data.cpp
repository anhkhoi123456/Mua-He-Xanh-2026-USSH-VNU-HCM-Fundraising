

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#include "data.hpp"
#include "httplib.h"
#include <chrono>
#include <atomic>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <cctype>
#include "json.hpp"

// Price table with int keys - O(1) lookup
std::unordered_map<std::string, uint64_t> priceTable;

void loadPricesFromGoogle() {
    std::cout << "[SYSTEM] Connecting to Google Sheets to fetch product database..." << std::endl;

    // Connect to Google Docs via HTTPS
    httplib::Client cli("https://docs.google.com");
    cli.set_follow_location(true); // CRITICAL: Google Sheets uses redirects, this tells httplib to follow them

    // Replace these with your actual DOC_ID and GID
    std::string docId = "14SKc8HEgUXFGW3jCat5TE54wZJIr76FqM-oFX6oBzxk";
    std::string gid = "1786818353";

    std::string path = "/spreadsheets/d/" + docId + "/export?format=tsv&gid=" + gid;

    auto res = cli.Get(path.c_str());

    if (res && res->status == 200) {
        // Treat the downloaded web response body exactly like a file
        std::stringstream ss(res->body);
        std::string line;
        
        std::getline(ss, line); // Skip the header row

        int loadedCount = 0;

        while (std::getline(ss, line)) {
            if (line.empty()) continue;

            std::stringstream lineStream(line);
            std::string idStr, nameStr, priceStr;

            if (std::getline(lineStream, idStr, '\t') && 
                std::getline(lineStream, nameStr, '\t') && 
                std::getline(lineStream, priceStr, '\t')) {
                
                try {                    
                    priceStr.erase(std::remove_if(priceStr.begin(), priceStr.end(), [](char c) {
                        return !std::isdigit(static_cast<unsigned char>(c));
                    }), priceStr.end());

                    uint64_t price = std::stoull(priceStr);
                    priceTable[idStr] = price;
                    loadedCount++;
                }
                catch (const std::exception& e) {
                    std::cerr << "[DATA WARNING] Skipping malformed row: " << line << std::endl;
                }
            }
        }
        std::cout << "[SYSTEM OK] Successfully downloaded and loaded " << loadedCount << " products into RAM." << std::endl;
    } else {
        std::cerr << "[SYSTEM FATAL] Failed to download TSV from Google. HTTP Status: " 
                  << (res ? std::to_string(res->status) : "Connection Failed") << std::endl;
    }
}

void calculateTotals(ClientData& cd){
    cd.totalProductCount = 0;
    cd.totalMoneyCount = 0;

    for(auto& i : cd.productCount){
        auto searchRes = priceTable.find(i.first);
        if(searchRes != priceTable.end()){
            cd.totalProductCount += i.second;
            cd.totalMoneyCount += i.second * searchRes -> second;
        }
    }
}

std::string generateID(){ // numeric string Order ID generation.
    static std::atomic<uint32_t> counter{0};

    uint64_t timestamp =
        std::chrono::duration_cast<
            std::chrono::milliseconds
        >(
            std::chrono::system_clock::now()
                .time_since_epoch()
        ).count();

    uint32_t seq = counter.fetch_add(1);

    timestamp * 1000ULL + seq;
    return std::to_string(timestamp);
}