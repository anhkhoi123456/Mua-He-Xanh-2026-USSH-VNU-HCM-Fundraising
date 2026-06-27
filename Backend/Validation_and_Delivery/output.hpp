

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#ifndef OUTPUT_HPP
#define OUTPUT_HPP

#include "data.hpp"
#include <string>

// Formats the calculated order data into a JSON string payload for the Google Sheets webhook
std::string generateGoogleSheetsPayload(const ClientData& cd);

#endif // OUTPUT_HPP