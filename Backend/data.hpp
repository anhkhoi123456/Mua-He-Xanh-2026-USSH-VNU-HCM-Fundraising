

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#ifndef DATA_HPP
#define DATA_HPP

#include <unordered_map>
#include <string>
#include <cstdint>

struct ClientData {
    std::string orderID, fullName, uniName, phone, zaloPhone, email, deliveryAddress;

    // Number of products into format ID : Count.
    std::unordered_map<std::string, int> productCount;
    unsigned int totalProductCount = 0;
    uint64_t totalMoneyCount = 0;
};

void calculateTotals(ClientData& cd);
std::string generateID();
void loadPricesFromGoogle();

#endif