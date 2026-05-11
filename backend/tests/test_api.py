"""
Backend API Tests for Intermaven
Tests: Auth, User, AI Generation, Notifications, Activities
"""
import pytest
import requests
import os
import random

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://151c44ef-2fa8-40cf-a20d-7837dfcf2942.preview.emergentagent.com').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "Intermaven API"
        print("✓ Health check passed")


class TestAuth:
    """Authentication endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_api_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_register_success(self):
        """Test user registration"""
        response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Test",
            "last_name": "User",
            "phone": "+254712345678",
            "portal": "music"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email.lower()
        assert data["user"]["first_name"] == "Test"
        assert data["user"]["plan"] == "free"
        assert data["user"]["credits"] == 150
        assert "apps" in data["user"]
        print(f"✓ Registration successful for {self.test_email}")
        print(f"  - Default apps: {data['user']['apps']}")
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        # First registration
        self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Test",
            "last_name": "User",
            "portal": "music"
        })
        
        # Second registration with same email
        response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Test2",
            "last_name": "User2",
            "portal": "music"
        })
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
        print("✓ Duplicate email registration correctly rejected")
    
    def test_login_success(self):
        """Test user login"""
        # First register
        self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Test",
            "last_name": "User",
            "portal": "music"
        })
        
        # Then login
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.test_email,
            "password": self.test_password
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email.lower()
        print("✓ Login successful")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_get_me_authenticated(self):
        """Test getting current user info"""
        # Register and get token
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Test",
            "last_name": "User",
            "portal": "music"
        })
        token = reg_response.json()["access_token"]
        
        # Get user info
        response = self.session.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.test_email.lower()
        print("✓ Get current user info successful")
    
    def test_get_me_unauthenticated(self):
        """Test getting user info without token"""
        response = self.session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated request correctly rejected")


class TestUserProfile:
    """User profile endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_profile_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register and get token
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Profile",
            "last_name": "Test",
            "portal": "music"
        })
        self.token = reg_response.json()["access_token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_update_profile(self):
        """Test updating user profile"""
        response = self.session.put(
            f"{BASE_URL}/api/user/profile",
            json={
                "first_name": "Updated",
                "last_name": "Name",
                "brand_name": "Test Brand",
                "bio": "Test bio"
            },
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
        assert data["brand_name"] == "Test Brand"
        assert data["bio"] == "Test bio"
        print("✓ Profile update successful")
    
    def test_get_user_stats(self):
        """Test getting user stats"""
        response = self.session.get(
            f"{BASE_URL}/api/user/stats",
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "credits" in data
        assert "plan" in data
        assert "ai_runs_week" in data
        assert "active_apps" in data
        print(f"✓ User stats retrieved: {data}")
    
    def test_toggle_app(self):
        """Test toggling app in user's apps list"""
        # Add musicbio app
        response = self.session.post(
            f"{BASE_URL}/api/user/apps/toggle",
            json={"app_id": "musicbio"},
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "musicbio" in data["apps"]
        print(f"✓ App toggle (add) successful: {data['apps']}")
        
        # Remove musicbio app
        response = self.session.post(
            f"{BASE_URL}/api/user/apps/toggle",
            json={"app_id": "musicbio"},
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "musicbio" not in data["apps"]
        print(f"✓ App toggle (remove) successful: {data['apps']}")


class TestNotifications:
    """Notification endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_notif_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register and get token
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Notif",
            "last_name": "Test",
            "portal": "music"
        })
        self.token = reg_response.json()["access_token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_notifications(self):
        """Test getting notifications"""
        response = self.session.get(
            f"{BASE_URL}/api/notifications",
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert "unread_count" in data
        # New user should have welcome notification
        assert len(data["notifications"]) >= 1
        print(f"✓ Notifications retrieved: {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_mark_notifications_read(self):
        """Test marking notifications as read"""
        response = self.session.post(
            f"{BASE_URL}/api/notifications/mark-read",
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Verify unread count is 0
        notif_response = self.session.get(
            f"{BASE_URL}/api/notifications",
            headers=self.auth_headers
        )
        assert notif_response.json()["unread_count"] == 0
        print("✓ Mark notifications read successful")


class TestActivities:
    """Activity endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_activity_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register and get token
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Activity",
            "last_name": "Test",
            "portal": "music"
        })
        self.token = reg_response.json()["access_token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_activities(self):
        """Test getting activities"""
        response = self.session.get(
            f"{BASE_URL}/api/activities",
            headers=self.auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "activities" in data
        print(f"✓ Activities retrieved: {len(data['activities'])} activities")


class TestAIGeneration:
    """AI Generation endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_ai_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register and get token
        reg_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "AI",
            "last_name": "Test",
            "portal": "music"
        })
        self.token = reg_response.json()["access_token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_generate_brandkit(self):
        """Test Brand Kit AI generation"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/generate",
            json={
                "tool_id": "brandkit",
                "inputs": {
                    "name": "Test Brand",
                    "industry": "Music / Entertainment",
                    "audience": "Young Nairobi professionals",
                    "vibe": "bold, warm, futuristic"
                }
            },
            headers=self.auth_headers,
            timeout=60  # AI generation can take time
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "content" in data
        assert "credits_used" in data
        assert "credits_remaining" in data
        print(f"✓ Brand Kit AI generation successful")
        print(f"  - Credits used: {data['credits_used']}")
        print(f"  - Credits remaining: {data['credits_remaining']}")
    
    def test_generate_social_free(self):
        """Test Social AI generation (free tool)"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/generate",
            json={
                "tool_id": "social",
                "inputs": {
                    "topic": "New single dropping Friday",
                    "platform": "Instagram",
                    "goal": "Announce a release",
                    "tone": "Hype & bold"
                }
            },
            headers=self.auth_headers,
            timeout=60
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["credits_used"] == 0  # Social AI is free
        print(f"✓ Social AI generation successful (free)")
    
    def test_generate_invalid_tool(self):
        """Test generation with invalid tool ID"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/generate",
            json={
                "tool_id": "invalid_tool",
                "inputs": {}
            },
            headers=self.auth_headers
        )
        assert response.status_code == 400
        print("✓ Invalid tool ID correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
