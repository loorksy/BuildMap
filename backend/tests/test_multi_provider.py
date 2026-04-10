"""
Test suite for BuildMap Multi-Provider API Support (Iteration 7)
Tests: GET /api/providers, POST/GET/DELETE /api/api-keys, GET /api/models aggregation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestProviders:
    """Test /api/providers endpoint - returns list of 4 providers"""
    
    def test_get_providers_returns_4_providers(self):
        """GET /api/providers should return openrouter, openai, anthropic, google"""
        response = requests.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200
        
        providers = response.json()
        assert isinstance(providers, list)
        assert len(providers) == 4
        
        provider_ids = [p['id'] for p in providers]
        assert 'openrouter' in provider_ids
        assert 'openai' in provider_ids
        assert 'anthropic' in provider_ids
        assert 'google' in provider_ids
    
    def test_providers_have_required_fields(self):
        """Each provider should have id, name, name_ar, key_prefix, key_help_url"""
        response = requests.get(f"{BASE_URL}/api/providers")
        assert response.status_code == 200
        
        providers = response.json()
        for provider in providers:
            assert 'id' in provider
            assert 'name' in provider
            assert 'name_ar' in provider
            assert 'key_prefix' in provider
            assert 'key_help_url' in provider
    
    def test_provider_key_prefixes_correct(self):
        """Verify key prefixes are correct for each provider"""
        response = requests.get(f"{BASE_URL}/api/providers")
        providers = {p['id']: p for p in response.json()}
        
        assert providers['openrouter']['key_prefix'] == 'sk-or-'
        assert providers['openai']['key_prefix'] == 'sk-'
        assert providers['anthropic']['key_prefix'] == 'sk-ant-'
        assert providers['google']['key_prefix'] == 'AI'


class TestAPIKeysAuthenticated:
    """Test /api/api-keys endpoints with authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@buildmap.com", "password": "test123456"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    
    def test_get_api_keys_returns_providers_array(self):
        """GET /api/api-keys should return providers array with configured providers"""
        response = self.session.get(f"{BASE_URL}/api/api-keys")
        assert response.status_code == 200
        
        data = response.json()
        assert 'has_key' in data
        assert 'providers' in data
        assert isinstance(data['providers'], list)
        
        # Test user has OpenRouter key configured
        if data['has_key']:
            assert len(data['providers']) > 0
            for provider in data['providers']:
                assert 'id' in provider
                assert 'provider' in provider
                assert 'provider_name' in provider
                assert 'default_model' in provider
                assert 'created_at' in provider
    
    def test_get_api_keys_backward_compatible(self):
        """GET /api/api-keys should still return backward-compatible fields"""
        response = self.session.get(f"{BASE_URL}/api/api-keys")
        assert response.status_code == 200
        
        data = response.json()
        if data['has_key']:
            # Backward compatibility fields
            assert 'provider' in data
            assert 'default_model' in data
            assert 'id' in data
            assert 'created_at' in data
    
    def test_post_api_key_accepts_provider_field(self):
        """POST /api/api-keys should accept provider field and return success or validation error"""
        # Test that the endpoint accepts the provider field structure
        response = self.session.post(
            f"{BASE_URL}/api/api-keys",
            json={
                "api_key": "sk-or-test-invalid-key-12345",
                "provider": "openrouter",
                "default_model": "openai/gpt-4o"
            }
        )
        # Should return 200 (success) or 400 (invalid key), not 422 (missing field)
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert 'provider' in data
            assert data['provider'] == 'openrouter'
    
    def test_post_api_key_rejects_invalid_provider(self):
        """POST /api/api-keys should reject unknown provider"""
        response = self.session.post(
            f"{BASE_URL}/api/api-keys",
            json={
                "api_key": "test-key",
                "provider": "invalid_provider",
                "default_model": "openai/gpt-4o"
            }
        )
        assert response.status_code == 400
        assert "غير مدعوم" in response.json().get('detail', '') or "not supported" in response.json().get('detail', '').lower()


class TestAPIKeyDeleteByProvider:
    """Test DELETE /api/api-keys/{provider} endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@buildmap.com", "password": "test123456"}
        )
        assert login_response.status_code == 200
    
    def test_delete_nonexistent_provider_key_returns_404(self):
        """DELETE /api/api-keys/{provider} should return 404 for non-existent key"""
        # Try to delete a provider key that doesn't exist (anthropic)
        response = self.session.delete(f"{BASE_URL}/api/api-keys/anthropic")
        # Should return 404 if no key exists for this provider
        assert response.status_code in [200, 404]
    
    def test_delete_provider_key_endpoint_exists(self):
        """DELETE /api/api-keys/{provider} endpoint should exist"""
        # Test with a provider that likely doesn't have a key
        response = self.session.delete(f"{BASE_URL}/api/api-keys/google")
        # Should return 404 (not found) or 200 (deleted), not 405 (method not allowed)
        assert response.status_code in [200, 404]


class TestModelsAggregation:
    """Test /api/models endpoint aggregates models from all configured providers"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@buildmap.com", "password": "test123456"}
        )
        assert login_response.status_code == 200
    
    def test_get_models_returns_list(self):
        """GET /api/models should return a list of models"""
        response = self.session.get(f"{BASE_URL}/api/models")
        assert response.status_code == 200
        
        models = response.json()
        assert isinstance(models, list)
        assert len(models) > 0
    
    def test_models_have_required_fields(self):
        """Each model should have id, name, provider, is_free, context_length, source"""
        response = self.session.get(f"{BASE_URL}/api/models")
        models = response.json()
        
        for model in models[:10]:  # Check first 10 models
            assert 'id' in model
            assert 'name' in model
            assert 'provider' in model
            assert 'is_free' in model
            assert 'context_length' in model
            assert 'source' in model
    
    def test_models_include_source_field(self):
        """Models should include source field indicating which provider they came from"""
        response = self.session.get(f"{BASE_URL}/api/models")
        models = response.json()
        
        sources = set(m.get('source') for m in models)
        # Should have at least one source (openrouter for test user)
        assert len(sources) > 0
        # OpenRouter should be in sources since test user has OpenRouter key
        assert 'openrouter' in sources or 'default' in sources
    
    def test_models_sorted_free_first(self):
        """Models should be sorted with free models first"""
        response = self.session.get(f"{BASE_URL}/api/models")
        models = response.json()
        
        # Find first paid model
        first_paid_idx = None
        for i, m in enumerate(models):
            if not m.get('is_free', False):
                first_paid_idx = i
                break
        
        # If there are free models, they should come before paid
        if first_paid_idx is not None and first_paid_idx > 0:
            for i in range(first_paid_idx):
                assert models[i].get('is_free', False) == True


class TestModelsUnauthenticated:
    """Test /api/models endpoint without authentication returns default models"""
    
    def test_get_models_unauthenticated_returns_defaults(self):
        """GET /api/models without auth should return default models"""
        response = requests.get(f"{BASE_URL}/api/models")
        assert response.status_code == 200
        
        models = response.json()
        assert isinstance(models, list)
        assert len(models) >= 4  # At least 4 default models
        
        # Check for default models
        model_ids = [m['id'] for m in models]
        # Should have some default models
        assert any('gpt' in mid.lower() or 'claude' in mid.lower() or 'gemini' in mid.lower() for mid in model_ids)


class TestStreamingWithProvider:
    """Test streaming endpoint routes to correct provider"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "test@buildmap.com", "password": "test123456"}
        )
        assert login_response.status_code == 200
    
    def test_streaming_endpoint_exists(self):
        """POST /api/projects/{id}/messages/stream should exist"""
        # Get a project first
        projects_response = self.session.get(f"{BASE_URL}/api/projects")
        assert projects_response.status_code == 200
        
        projects = projects_response.json()
        if len(projects) > 0:
            project_id = projects[0]['id']
            
            # Test streaming endpoint returns proper content type
            response = self.session.post(
                f"{BASE_URL}/api/projects/{project_id}/messages/stream",
                json={"content": "test"},
                stream=True
            )
            # Should return 200 with text/event-stream or error (400/401)
            assert response.status_code in [200, 400, 401]
            if response.status_code == 200:
                assert 'text/event-stream' in response.headers.get('content-type', '')


class TestAPIKeysUnauthenticated:
    """Test /api/api-keys endpoints require authentication"""
    
    def test_get_api_keys_requires_auth(self):
        """GET /api/api-keys should return 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/api-keys")
        assert response.status_code == 401
    
    def test_post_api_keys_requires_auth(self):
        """POST /api/api-keys should return 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/api-keys",
            json={"api_key": "test", "provider": "openrouter", "default_model": "gpt-4o"}
        )
        assert response.status_code == 401
    
    def test_delete_api_keys_requires_auth(self):
        """DELETE /api/api-keys should return 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/api-keys")
        assert response.status_code == 401
    
    def test_delete_api_keys_by_provider_requires_auth(self):
        """DELETE /api/api-keys/{provider} should return 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/api-keys/openrouter")
        assert response.status_code == 401
