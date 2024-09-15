#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <username> <password>"
    exit 1
fi

username=$1
password=$2

token=$(curl -X POST http://localhost:3000/login -d "username=$username&password=$password" | jq -r '.token')
curl -H "Authorization: Bearer $token" http://localhost:3000/reservations