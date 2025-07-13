#!/bin/bash

# Test API endpoints for users
BASE_URL="http://localhost:3000"

echo "🧪 Testing User API Endpoints"
echo "=============================="

# Test 1: Get all users
echo "1. Testing GET /api/users (Get all users)"
curl -X GET "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Response received (jq not available)"

echo -e "\n"

# Test 2: Get specific user (replace with actual user ID)
echo "2. Testing GET /api/users/{id} (Get specific user)"
echo "Note: Replace 'test-user-id' with an actual user ID from your database"
curl -X GET "$BASE_URL/api/users/test-user-id" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Response received (jq not available)"

echo -e "\n"

# Test 3: Test invalid method
echo "3. Testing POST /api/users (Should return 405 Method Not Allowed)"
curl -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Response received (jq not available)"

echo -e "\n"

# Test 4: Test invalid user ID
echo "4. Testing GET /api/users/invalid-id (Should return 404)"
curl -X GET "$BASE_URL/api/users/invalid-id" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || echo "Response received (jq not available)"

echo -e "\n"
echo "✅ API Testing Complete!" 