

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#ifndef INPUT_HPP
#define INPUT_HPP

#include "data.hpp"
#include <string>

// Deserializes the incoming raw JSON string payload directly into a ClientData struct instance
bool parseFrontendRequest(const std::string& jsonRequestBody, ClientData& outClientData);

#endif // INPUT_HPP