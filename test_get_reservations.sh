token=$(curl -X POST http://localhost:3000/login -d "username=admin&password=a-really-tough-password" | jq -r '.token')
curl -H "Authorization: Bearer $token" http://localhost:3000/reservations