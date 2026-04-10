#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class BuildMapAPITester:
    def __init__(self, base_url="https://buildmap-ideas.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()  # Use session to maintain cookies
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_models_endpoint(self):
        """Test models endpoint"""
        success, response = self.run_test("Available Models", "GET", "models", 200)
        if success and isinstance(response, list) and len(response) > 0:
            print(f"Found {len(response)} models")
            return True
        return False

    def test_register(self, email, password, name):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": email, "password": password, "name": name}
        )
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"User registered with ID: {self.user_id}")
            return True
        return False

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"User logged in with ID: {self.user_id}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_api_key_operations(self, api_key="sk-or-test-key-123"):
        """Test API key CRUD operations"""
        # Test getting API key (should be empty initially)
        success, response = self.run_test("Get API Key (Empty)", "GET", "api-keys", 200)
        if not success:
            return False

        # Test creating API key
        success, response = self.run_test(
            "Create API Key",
            "POST",
            "api-keys",
            200,
            data={"api_key": api_key, "default_model": "openai/gpt-4"}
        )
        if not success:
            return False

        # Test getting API key (should exist now)
        success, response = self.run_test("Get API Key (Exists)", "GET", "api-keys", 200)
        if not success or not response.get('has_key'):
            return False

        # Test deleting API key
        success, response = self.run_test("Delete API Key", "DELETE", "api-keys", 200)
        return success

    def test_project_operations(self):
        """Test project CRUD operations"""
        # Test getting projects (should be empty initially)
        success, response = self.run_test("Get Projects (Empty)", "GET", "projects", 200)
        if not success:
            return False

        # Test creating project
        project_data = {
            "title": "مشروع تجريبي",
            "idea": "فكرة تطبيق توصيل طلبات للمطاعم"
        }
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data
        )
        if not success or 'id' not in response:
            return False

        project_id = response['id']
        print(f"Project created with ID: {project_id}")

        # Test getting specific project
        success, response = self.run_test(
            "Get Project",
            "GET",
            f"projects/{project_id}",
            200
        )
        if not success:
            return False

        # Test updating project
        success, response = self.run_test(
            "Update Project",
            "PATCH",
            f"projects/{project_id}",
            200,
            data={"title": "مشروع محدث"}
        )
        if not success:
            return False

        # Test getting project messages
        success, response = self.run_test(
            "Get Project Messages",
            "GET",
            f"projects/{project_id}/messages",
            200
        )
        if not success:
            return False

        # Test deleting project
        success, response = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{project_id}",
            200
        )
        return success

    def test_auth_protection(self):
        """Test that protected endpoints require authentication"""
        # Create a new session without cookies for this test
        temp_session = requests.Session()
        url = f"{self.base_url}/auth/me"
        response = temp_session.get(url, headers={'Content-Type': 'application/json'})
        
        success = response.status_code == 401
        self.tests_run += 1
        print(f"\n🔍 Testing Protected Endpoint (No Auth)...")
        if success:
            self.tests_passed += 1
            print(f"✅ Passed - Status: {response.status_code}")
        else:
            print(f"❌ Failed - Expected 401, got {response.status_code}")
        return success

def main():
    # Setup
    tester = BuildMapAPITester()
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@buildmap.com"
    test_password = "test123456"
    test_name = "مستخدم تجريبي"

    print("🚀 Starting BuildMap API Tests")
    print(f"Base URL: {tester.base_url}")

    # Test basic endpoints
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed, stopping tests")
        return 1

    if not tester.test_models_endpoint():
        print("❌ Models endpoint failed, stopping tests")
        return 1

    # Test authentication protection
    if not tester.test_auth_protection():
        print("❌ Auth protection test failed")
        return 1

    # Test user registration
    if not tester.test_register(test_email, test_password, test_name):
        print("❌ Registration failed, stopping tests")
        return 1

    # Test getting current user
    if not tester.test_get_me():
        print("❌ Get current user failed")
        return 1

    # Test API key operations
    if not tester.test_api_key_operations():
        print("❌ API key operations failed")
        return 1

    # Test project operations
    if not tester.test_project_operations():
        print("❌ Project operations failed")
        return 1

    # Test login with existing user (use test credentials)
    if not tester.test_login("test@buildmap.com", "test123456"):
        print("❌ Login with test credentials failed")
        return 1

    # Print results
    print(f"\n📊 Tests Summary:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())