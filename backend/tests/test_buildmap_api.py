"""
BuildMap API Tests - Iteration 5
Testing: Auth, Projects, Analysis, Export, Models endpoints
New features: Enhanced analysis with complexity/skills/verification, ZIP export
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
TEST_EMAIL = "test@buildmap.com"
TEST_PASSWORD = "test123456"
TEST_NAME = "مستخدم تجريبي"


class TestRootEndpoint:
    """Test API root endpoint"""
    
    def test_api_root_returns_correct_response(self):
        """Test /api/ returns correct version info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "BuildMap API"
        assert "version" in data
        assert data["version"] == "2.0.0"
        print(f"✓ API root endpoint working: {data}")


class TestAuthEndpoints:
    """Test authentication endpoints with cookies"""
    
    @pytest.fixture
    def session(self):
        """Create a session with cookie support"""
        return requests.Session()
    
    def test_login_with_valid_credentials(self, session):
        """Test /api/auth/login with test credentials"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert data["email"] == TEST_EMAIL
        assert "name" in data
        # Check cookies are set
        assert "access_token" in session.cookies or response.cookies.get("access_token")
        print(f"✓ Login successful: {data['email']}")
        return session
    
    def test_login_with_invalid_credentials(self, session):
        """Test /api/auth/login with wrong password"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_current_user_without_auth(self, session):
        """Test /api/auth/me without authentication"""
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Unauthenticated request correctly rejected")
    
    def test_get_current_user_with_auth(self, session):
        """Test /api/auth/me with valid session"""
        # First login
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        
        # Then get user info
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert "id" in data
        assert "name" in data
        assert "created_at" in data
        print(f"✓ Get current user working: {data['email']}")


class TestModelsEndpoint:
    """Test AI models endpoint"""
    
    def test_get_models_list(self):
        """Test /api/models returns model list"""
        session = requests.Session()
        # Login first
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        response = session.get(f"{BASE_URL}/api/models")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check model structure
        model = data[0]
        assert "id" in model
        assert "name" in model
        assert "provider" in model
        print(f"✓ Models endpoint working: {len(data)} models available")


class TestProjectsEndpoints:
    """Test project CRUD endpoints"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        return session
    
    def test_get_projects_list(self, auth_session):
        """Test /api/projects returns user projects"""
        response = auth_session.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Check project structure if any exist
        if len(data) > 0:
            project = data[0]
            assert "id" in project
            assert "title" in project
            assert "idea" in project
            assert "has_outputs" in project
        print(f"✓ Projects list working: {len(data)} projects found")
        return data
    
    def test_create_project(self, auth_session):
        """Test POST /api/projects creates new project"""
        response = auth_session.post(f"{BASE_URL}/api/projects", json={
            "title": "TEST_مشروع اختباري",
            "idea": "فكرة تطبيق ويب لإدارة المهام"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == "TEST_مشروع اختباري"
        assert "selected_model" in data
        assert "has_outputs" in data
        print(f"✓ Project created: {data['id']}")
        return data["id"]
    
    def test_get_single_project(self, auth_session):
        """Test GET /api/projects/{id} returns project details"""
        # First get list to find a project
        projects = auth_session.get(f"{BASE_URL}/api/projects").json()
        if len(projects) == 0:
            pytest.skip("No projects to test")
        
        project_id = projects[0]["id"]
        response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert "title" in data
        assert "idea" in data
        assert "selected_model" in data
        print(f"✓ Get single project working: {data['title']}")


class TestAnalysisEndpoint:
    """Test enhanced analysis endpoint with new AI system features"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return session
    
    def test_analysis_returns_enhanced_data(self, auth_session):
        """Test /api/projects/{id}/analysis returns complexity, skills, verification"""
        # Get a project
        projects = auth_session.get(f"{BASE_URL}/api/projects").json()
        if len(projects) == 0:
            pytest.skip("No projects to test analysis")
        
        project_id = projects[0]["id"]
        response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}/analysis")
        assert response.status_code == 200
        data = response.json()
        
        # Check basic analysis fields
        assert "current_stage" in data
        assert "completed_stages" in data
        assert "total_progress" in data
        assert "project_summary" in data
        assert "suggestions" in data
        
        # Check NEW enhanced fields from ai_system.py
        assert "complexity" in data, "Missing complexity field from AI system"
        assert "suggested_skills" in data, "Missing suggested_skills field from AI system"
        assert "verification" in data, "Missing verification field from AI system"
        assert "user_type" in data, "Missing user_type field from AI system"
        
        # Validate complexity structure
        complexity = data["complexity"]
        if complexity:
            assert "level" in complexity or "level_ar" in complexity
            print(f"  - Complexity: {complexity.get('level_ar', complexity.get('level', 'N/A'))}")
        
        # Validate suggested_skills structure
        skills = data["suggested_skills"]
        assert isinstance(skills, list)
        if len(skills) > 0:
            skill = skills[0]
            assert "id" in skill or "name" in skill or "name_ar" in skill
            print(f"  - Skills: {[s.get('name_ar', s.get('name', 'N/A')) for s in skills[:3]]}")
        
        # Validate verification structure
        verification = data["verification"]
        assert isinstance(verification, list)
        if len(verification) > 0:
            v = verification[0]
            assert "step" in v or "passed" in v or "message" in v
            print(f"  - Verification steps: {len(verification)}")
        
        # Validate user_type structure
        user_type = data["user_type"]
        if user_type:
            print(f"  - User type: {user_type.get('name_ar', user_type.get('type', 'N/A'))}")
        
        print(f"✓ Enhanced analysis working for project {project_id}")
        print(f"  - Progress: {data['total_progress']}%")
        print(f"  - Current stage: {data['current_stage']}")


class TestExportEndpoint:
    """Test ZIP export endpoint"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return session
    
    def test_export_returns_404_when_no_outputs(self, auth_session):
        """Test /api/projects/{id}/export returns 404 when no outputs exist"""
        # Get a project
        projects = auth_session.get(f"{BASE_URL}/api/projects").json()
        if len(projects) == 0:
            pytest.skip("No projects to test export")
        
        # Find a project without outputs
        project_without_outputs = None
        for p in projects:
            if not p.get("has_outputs", False):
                project_without_outputs = p
                break
        
        if not project_without_outputs:
            pytest.skip("All projects have outputs, cannot test 404 case")
        
        project_id = project_without_outputs["id"]
        response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}/export")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Export correctly returns 404 when no outputs exist")
    
    def test_export_returns_zip_when_outputs_exist(self, auth_session):
        """Test /api/projects/{id}/export returns ZIP when outputs exist"""
        # Get a project with outputs
        projects = auth_session.get(f"{BASE_URL}/api/projects").json()
        project_with_outputs = None
        for p in projects:
            if p.get("has_outputs", False):
                project_with_outputs = p
                break
        
        if not project_with_outputs:
            pytest.skip("No projects with outputs to test ZIP export")
        
        project_id = project_with_outputs["id"]
        response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}/export")
        assert response.status_code == 200
        assert "application/zip" in response.headers.get("content-type", "")
        assert len(response.content) > 0
        print(f"✓ Export returns valid ZIP file for project with outputs")


class TestMessagesEndpoint:
    """Test messages endpoint"""
    
    @pytest.fixture
    def auth_session(self):
        """Create authenticated session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return session
    
    def test_get_project_messages(self, auth_session):
        """Test GET /api/projects/{id}/messages returns messages"""
        projects = auth_session.get(f"{BASE_URL}/api/projects").json()
        if len(projects) == 0:
            pytest.skip("No projects to test messages")
        
        project_id = projects[0]["id"]
        response = auth_session.get(f"{BASE_URL}/api/projects/{project_id}/messages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Check message structure if any exist
        if len(data) > 0:
            msg = data[0]
            assert "id" in msg
            assert "role" in msg
            assert "content" in msg
            assert "created_at" in msg
        print(f"✓ Messages endpoint working: {len(data)} messages found")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_projects(self):
        """Delete TEST_ prefixed projects"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        projects = session.get(f"{BASE_URL}/api/projects").json()
        deleted = 0
        for p in projects:
            if p["title"].startswith("TEST_"):
                response = session.delete(f"{BASE_URL}/api/projects/{p['id']}")
                if response.status_code in [200, 204]:
                    deleted += 1
        
        print(f"✓ Cleanup: Deleted {deleted} test projects")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
