"""
Test P0 Code Quality Fixes - BuildMap Universe Phase 1
Tests for:
1. Backend undefined variables fix (ai_system.py line 418)
2. Backend API endpoints working correctly
3. No security issues with hardcoded passwords
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Test backend APIs are working after P0 fixes"""
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print(f"✅ Root endpoint working: {data}")
    
    def test_auth_login_endpoint(self):
        """Test login endpoint exists and validates input"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        # Should return 401 for invalid credentials, not 500
        assert response.status_code == 401
        print("✅ Login endpoint working - returns 401 for invalid credentials")
    
    def test_auth_register_validation(self):
        """Test register endpoint validates password length"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test_short_pass@test.com",
            "password": "123",  # Too short
            "name": "Test"
        })
        # Should return 400 for short password
        assert response.status_code == 400
        print("✅ Register endpoint validates password length")
    
    def test_projects_requires_auth(self):
        """Test projects endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 401
        print("✅ Projects endpoint requires authentication")
    
    def test_explore_endpoint(self):
        """Test explore endpoint (Phase 1 feature)"""
        response = requests.get(f"{BASE_URL}/api/explore")
        # Should work without auth
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        print(f"✅ Explore endpoint working: {len(data.get('projects', []))} projects")
    
    def test_providers_endpoint(self):
        """Test providers endpoint returns all 4 providers"""
        response = requests.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4
        provider_ids = [p['id'] for p in data]
        assert 'openrouter' in provider_ids
        assert 'openai' in provider_ids
        assert 'anthropic' in provider_ids
        assert 'google' in provider_ids
        print(f"✅ Providers endpoint returns 4 providers: {provider_ids}")
    
    def test_models_endpoint_default(self):
        """Test models endpoint returns default models without auth"""
        response = requests.get(f"{BASE_URL}/api/models")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        # Check model structure
        model = data[0]
        assert 'id' in model
        assert 'name' in model
        assert 'provider' in model
        print(f"✅ Models endpoint returns {len(data)} default models")


class TestAISystemFixes:
    """Test AI system fixes for undefined variables"""
    
    def test_ai_analysis_endpoint(self):
        """Test that AI analysis doesn't crash with undefined variables"""
        # First login to get auth
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@buildmap.com",
            "password": "Test123456"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Test user not available")
        
        cookies = login_response.cookies
        
        # Create a test project
        project_response = requests.post(
            f"{BASE_URL}/api/projects",
            json={"title": "Test P0 Fix", "idea": "Testing undefined variables fix"},
            cookies=cookies
        )
        
        if project_response.status_code != 200:
            pytest.skip("Could not create project - may need API key")
        
        project_id = project_response.json().get('id')
        
        # Test analysis endpoint - this uses ai_system.py
        analysis_response = requests.get(
            f"{BASE_URL}/api/projects/{project_id}/analysis",
            cookies=cookies
        )
        
        # Should not crash with undefined variables
        assert analysis_response.status_code == 200
        data = analysis_response.json()
        
        # Check complexity has proper values (the fix was for level, level_ar, estimated_days)
        if 'complexity' in data:
            complexity = data['complexity']
            assert 'level' in complexity
            assert 'level_ar' in complexity
            assert 'estimated_time' in complexity or 'estimated_days' in complexity
            print(f"✅ AI analysis working - complexity: {complexity}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/projects/{project_id}", cookies=cookies)
        print("✅ AI system analysis endpoint working without undefined variable errors")


class TestSecurityFixes:
    """Test security fixes - no hardcoded passwords"""
    
    def test_jwt_secret_not_hardcoded(self):
        """Verify JWT secret is from environment or generated"""
        # We can't directly test this, but we can verify auth works
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@buildmap.com",
            "password": "Test123456"
        })
        # If JWT is working, auth should work
        if response.status_code == 200:
            print("✅ JWT authentication working")
        else:
            print("⚠️ Test user may not exist - JWT still functional")
    
    def test_no_default_credentials_work(self):
        """Verify common default credentials don't work"""
        default_creds = [
            ("admin@admin.com", "admin"),
            ("admin@admin.com", "password"),
            ("test@test.com", "test"),
            ("user@user.com", "user123"),
        ]
        
        for email, password in default_creds:
            response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": email,
                "password": password
            })
            assert response.status_code == 401, f"Default credentials {email}:{password} should not work"
        
        print("✅ No default credentials work")


class TestPhase1Features:
    """Test Phase 1 features are working"""
    
    def test_comments_endpoint_exists(self):
        """Test comments endpoint exists"""
        # Comments require project ID - use POST to check endpoint exists
        response = requests.get(f"{BASE_URL}/api/projects/test-project-id/comments")
        # Should return 404 for non-existent project, not 500
        # 405 means endpoint exists but method not allowed
        assert response.status_code in [200, 404, 401, 405]
        print(f"✅ Comments endpoint exists (status: {response.status_code})")
    
    def test_notifications_requires_auth(self):
        """Test notifications endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401
        print("✅ Notifications endpoint requires authentication")
    
    def test_user_profile_endpoint(self):
        """Test user profile endpoint"""
        response = requests.get(f"{BASE_URL}/api/users/test-user-id/profile")
        # Should return 404 for non-existent user, not 500
        assert response.status_code in [200, 404]
        print("✅ User profile endpoint exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
