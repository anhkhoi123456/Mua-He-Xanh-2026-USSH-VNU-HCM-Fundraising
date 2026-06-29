# Use a lightweight Linux environment
FROM ubuntu:22.04

# 🌟 CRITICAL FIX: Added libssl-dev to support HTTPS requests to Google Sheets
RUN apt-get update && apt-get install -y g++ make libssl-dev

# Set the working directory inside the cloud server
WORKDIR /app

# Copy all your backend files (cpp, hpp, csv) into the cloud server
COPY . .

# Compile your C++ code
# 🌟 CRITICAL FIX: Added -DCPPHTTPLIB_OPENSSL_SUPPORT, -lssl, and -lcrypto
RUN g++ server.cpp input.cpp data.cpp output.cpp -o server_app -std=c++11 -DCPPHTTPLIB_OPENSSL_SUPPORT -lpthread -lssl -lcrypto

# Tell Render what command to run when the server starts
CMD ["./server_app"]