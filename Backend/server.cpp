

// Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License.


#include "httplib.h"
#include "json.hpp"
#include "input.hpp"
#include "data.hpp"
#include "output.hpp"
#include <iostream>
#include <string>

using json = nlohmann::json;

int main() {
    // 1. Pre-runtime Initializations
    loadPricesFromCsv("products.csv"); 

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

        // Step B: Execute internal logic, calculations, and ID assignment (data.cpp)
        calculateTotals(orderContext);

        // Step C: Generate outgoing JSON payload (output.cpp)
        std::string sheetPayload = generateGoogleSheetsPayload(orderContext);

        // Step D: Transmit payload to Google Sheets Database
        httplib::Client cli("https://script.google.com");
        
        // CRITICAL: Must be enabled to follow Google Apps Script 302 redirects
        cli.set_follow_location(true); 
        std::string webhookPath = "/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec";

        auto googleRes = cli.Post(webhookPath.c_str(), sheetPayload, "application/json");
        
        // Step E: Evaluate Webhook Response
        bool deliveryStatus = (googleRes && googleRes->status == 200);
        
        if (deliveryStatus) {
            std::cout << "[SERVER] Order ID: " << orderContext.orderID 
                      << " securely dispatched to Google Sheets." << std::endl;
        } else {
            std::cerr << "[SERVER ERROR] Webhook dispatch failed. HTTP Status: " 
                      << (googleRes ? std::to_string(googleRes->status) : "Connection timeout/dropped") << std::endl;
        }

        // Step F: Construct response back to Frontend (cart.js)
        json responseJson;
        if (deliveryStatus) {
            responseJson["status"] = "success";
            responseJson["orderID"] = orderContext.orderID; 
            res.status = 200; // OK
        } else {
            responseJson["status"] = "partial_success";
            responseJson["message"] = "Order calculated locally, but database backup delayed.";
            responseJson["orderID"] = orderContext.orderID;
            res.status = 502; // Bad Gateway
        }

        res.set_content(responseJson.dump(), "application/json");
    });

    // 5. Fire up the execution listener
    std::cout << "[SERVER RUNNING] Operational on port 8080..." << std::endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}