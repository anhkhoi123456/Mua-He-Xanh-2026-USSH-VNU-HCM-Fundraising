

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#include "output.hpp"
#include "json.hpp"
#include <string>

using json = nlohmann::json;

std::string generateGoogleSheetsPayload(const ClientData& cd) {
    // 1. Package the C++ struct data into a JSON payload
    json payload;
    payload["orderID"] = std::to_string(cd.orderID);
    payload["fullName"] = cd.fullName;
    payload["uniName"] = cd.uniName;
    payload["phone"] = cd.phone;
    payload["zaloPhone"] = cd.zaloPhone;
    payload["email"] = cd.email;
    payload["deliveryAddress"] = cd.deliveryAddress;
    payload["totalProductCount"] = cd.totalProductCount;
    payload["totalMoneyCount"] = cd.totalMoneyCount;

    // 2. Serialize the shopping cart map into a flat string.
    // E.g., translates {1405231: 2, 1424578: 1} into "1405231:2|1424578:1"
    std::string cartDetails = "";
    for (const auto& item : cd.productCount) {
        if (!cartDetails.empty()) {
            cartDetails += "|";
        }
        cartDetails += std::to_string(item.first) + ":" + std::to_string(item.second);
    }
    payload["cartDetails"] = cartDetails;

    // 3. Return the stringified JSON payload
    return payload.dump();
}