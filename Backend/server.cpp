// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.

#include "httplib.h"
#include "json.hpp"
#include "input.hpp"
#include "data.hpp"
#include "output.hpp"
#include <iostream>
#include <string>
#include <thread>

using json = nlohmann::json;

int main() {
    // 1. Pre-runtime Initializations
    loadPricesFromGoogle();

    httplib::Server svr;

    // 2. CORS Configuration
    svr.set_post_routing_handler([](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    });

    svr.Options(R"(/api/.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 200;
    });

    // 3. Keep-Alive / Anti-Sleep Endpoint
    svr.Get("/ping", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("Pong!", "text/plain");
    });

    // 4. Primary Core Route: Checkout Processing pipeline
    svr.Post("/api/checkout", [](const httplib::Request& req, httplib::Response& res) {
        std::cout << "[SERVER] Incoming checkout request received..." << std::endl;

        ClientData orderContext;

        // Step A: Parse incoming JSON from Frontend (input.cpp)
        if (!parseFrontendRequest(req.body, orderContext)) {
            res.status = 400; // Bad Request
            res.set_content(R"({"status":"error","message":"Malformed request payload"})", "application/json");
            return;
        }
        orderContext.orderID = generateID();

        // Step B: Execute internal logic, calculations, and ID assignment (data.cpp)
        calculateTotals(orderContext);

        std::thread googleSheetThread([orderContext]() {
            try {
                // Step C: Generate outgoing JSON payload (output.cpp)
                std::string sheetPayload = generateGoogleSheetsPayload(orderContext);

                // Step D: Transmit payload to Google Sheets Database
                httplib::Client cli("https://script.google.com");
                cli.set_follow_location(true); 
                std::string webhookPath = "/macros/s/AKfycbw_q9Re0WSHfGYGalnVGeOYUdXSxlCpk0NtA_x9rqNyc7xFPIlMwYY9NFXS9GSFdND7xg/exec";

                auto googleRes = cli.Post(webhookPath.c_str(), sheetPayload, "application/json");
                
                if (googleRes && (googleRes->status == 200 || googleRes->status == 302)) {
                    std::cout << "[ASYNC OK] Order ID: " << orderContext.orderID 
                              << " securely dispatched to Google Sheets." << std::endl;
                } else {
                    std::cerr << "[ASYNC WARNING] Webhook dispatch completed with non-standard status: " 
                              << (googleRes ? std::to_string(googleRes->status) : "Connection dropped") << std::endl;
                }
            } 
            catch (const std::exception& e) {
                std::cerr << "[ASYNC CRITICAL ERROR] Thread crash: " << e.what() << std::endl;
            }
        });

        googleSheetThread.detach(); 

        json responseJson;
        responseJson["status"] = "success";
        responseJson["orderID"] = orderContext.orderID; 

        responseJson["totalMoneyCount"] = orderContext.totalMoneyCount;
        
        res.status = 200; // Đảm bảo luôn trả về 200 OK cho khách vui
        res.set_content(responseJson.dump(), "application/json");
    });

    // 5. Fire up the execution listener
    std::cout << "[SERVER RUNNING] Operational on port 8080..." << std::endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}