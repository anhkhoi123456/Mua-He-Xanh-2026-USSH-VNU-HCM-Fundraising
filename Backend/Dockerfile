# Use a lightweight Linux environment
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ \
    make \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the cloud server
WORKDIR /app

# Copy all your backend files (cpp, hpp, csv) into the cloud server
COPY . .

# Compile your C++ code
# CRITICAL FIX: Added -DCPPHTTPLIB_OPENSSL_SUPPORT, -lssl, and -lcrypto
RUN g++ Backend\Validation_and_Delivery\input.cpp Backend\Validation_and_Delivery\output.cpp Backend\data.cpp Backend\server.cpp -o server_app -std=c++11 -DCPPHTTPLIB_OPENSSL_SUPPORT -lpthread -lssl -lcrypto

# Tell Render what command to run when the server starts
CMD ["./server_app"]