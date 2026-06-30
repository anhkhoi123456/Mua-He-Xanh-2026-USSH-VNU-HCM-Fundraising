

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#ifndef DATA_HPP
#define DATA_HPP

#include <unordered_map>
#include <string>
#include <cstdint>

struct ClientData {
    std::string orderID, fullName, uniName, phone, zaloPhone, email, deliveryAddress;
        
    // Now uses int keys to handle your 7-digit ID codes safely
    std::unordered_map<std::string, int> productCount;
    unsigned int totalProductCount = 0;
    uint64_t totalMoneyCount = 0;
};

void calculateTotals(ClientData& cd);
uint64_t generateID();
void loadPricesFromGoogle();

#endif