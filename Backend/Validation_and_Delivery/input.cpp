

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#include "input.hpp"
#include "json.hpp"
#include <iostream>
#include <stdexcept>

using json = nlohmann::json;

bool parseFrontendRequest(const std::string& jsonRequestBody, ClientData& outClientData) {
    try {
        // Parse the raw payload string into an intermediate JSON object
        json parsedJson = json::parse(jsonRequestBody);

        // 1. Direct raw string property mapping
        outClientData.fullName = parsedJson.value("fullName", "");
        outClientData.uniName = parsedJson.value("uniName", "");
        outClientData.phone = parsedJson.value("phone", "");
        outClientData.zaloPhone = parsedJson.value("zaloPhone", "");
        outClientData.email = parsedJson.value("email", "");
        outClientData.deliveryAddress = parsedJson.value("deliveryAddress", "");

        // Reset the product count lookup map to clear old data
        outClientData.productCount.clear();

        // 2. Map structural cart contents to the lookup map
        if (parsedJson.contains("productCount") && parsedJson["productCount"].is_object()) {
            auto cartItems = parsedJson["productCount"];
            
            for (auto& item : cartItems.items()) {
                try {
                    // Force cast whatever string key sent by the frontend into an integer code
                    int productID = std::stoi(item.key());
                    int quantity  = item.value().get<int>();

                    // Feed it straight to the struct. data.cpp will deal with invalid/missing IDs later.
                    outClientData.productCount[productID] = quantity;
                }
                catch (const std::exception& innerEx) {
                    // Catch casting errors (e.g., if a key cannot be formatted to int) and skip it safely
                    std::cerr << "[INPUT] Skipping malformed cart property key: " 
                              << item.key() << " | Reason: " << innerEx.what() << std::endl;
                }
            }
        }

        return true; // Execution succeeded cleanly
    }
    catch (const json::parse_error& e) {
        std::cerr << "[INPUT CRITICAL] Aborting context execution. Corrupted payload JSON structure: " 
                  << e.what() << std::endl;
        return false;
    }
    catch (const std::exception& e) {
        std::cerr << "[INPUT ERROR] Caught unhandled transformation exception: " << e.what() << std::endl;
        return false;
    }
}