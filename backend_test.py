import requests
import sys
import json
from datetime import datetime

class Intermaven_API_Tester:
    def __init__(self, base_url="https://151c44ef-2fa8-40cf-a20d-7837dfcf2942.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except:
                    self.log_test(name, True, f"Status: {response.status_code} (No JSON)")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {error_data.get('detail', 'Unknown error')}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text[:100]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@intermaven.test",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+254712345678",
            "portal": "music"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.log_test("Registration Token", True, "Token received")
            return True
        elif success:
            self.log_test("Registration Token", False, "No token in response")
        
        return success

    def test_login(self):
        """Test user login with demo credentials"""
        login_data = {
            "email": "demo@intermaven.io",
            "password": "demo1234"
        }
        
        success, response = self.run_test(
            "User Login (Demo)",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.log_test("Login Token", True, "Demo user token received")
            return True
        elif success:
            self.log_test("Login Token", False, "No token in response")
        
        return success

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        if success and 'email' in response:
            self.log_test("User Data", True, f"Email: {response.get('email')}")
        
        return success

    def test_user_stats(self):
        """Test user stats endpoint"""
        if not self.token:
            self.log_test("User Stats", False, "No token available")
            return False
            
        success, response = self.run_test(
            "User Stats",
            "GET",
            "api/user/stats",
            200
        )
        
        if success:
            stats = ["credits", "plan", "ai_runs_week", "active_apps"]
            missing = [s for s in stats if s not in response]
            if missing:
                self.log_test("Stats Fields", False, f"Missing: {missing}")
            else:
                self.log_test("Stats Fields", True, f"Credits: {response.get('credits')}, Plan: {response.get('plan')}")
        
        return success

    def test_notifications(self):
        """Test notifications endpoint"""
        if not self.token:
            self.log_test("Notifications", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            "api/notifications",
            200
        )
        
        if success and 'notifications' in response:
            count = len(response['notifications'])
            self.log_test("Notifications Data", True, f"Found {count} notifications")
        
        return success

    def test_mark_notifications_read(self):
        """Test mark notifications as read"""
        if not self.token:
            self.log_test("Mark Notifications Read", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Mark Notifications Read",
            "POST",
            "api/notifications/mark-read",
            200
        )
        
        return success

    def test_profile_update(self):
        """Test profile update"""
        if not self.token:
            self.log_test("Profile Update", False, "No token available")
            return False
            
        update_data = {
            "first_name": "Updated",
            "brand_name": "Test Brand"
        }
        
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            "api/user/profile",
            200,
            data=update_data
        )
        
        if success and response.get('first_name') == 'Updated':
            self.log_test("Profile Data Updated", True, "First name updated successfully")
        elif success:
            self.log_test("Profile Data Updated", False, "Update not reflected in response")
        
        return success

    def test_ai_generation(self):
        """Test AI generation endpoint"""
        if not self.token:
            self.log_test("AI Generation", False, "No token available")
            return False
            
        # Test with social AI (free tool)
        ai_data = {
            "tool_id": "social",
            "inputs": {
                "topic": "Test post",
                "platform": "Instagram",
                "goal": "Drive engagement",
                "tone": "Fun & casual"
            }
        }
        
        success, response = self.run_test(
            "AI Generation (Social)",
            "POST",
            "api/ai/generate",
            200,
            data=ai_data
        )
        
        if success and 'content' in response:
            content_length = len(response['content'])
            self.log_test("AI Content Generated", True, f"Generated {content_length} characters")
        elif success:
            self.log_test("AI Content Generated", False, "No content in response")
        
        return success

    def test_activities(self):
        """Test activities endpoint"""
        if not self.token:
            self.log_test("Activities", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Activities",
            "GET",
            "api/activities",
            200
        )
        
        if success and 'activities' in response:
            count = len(response['activities'])
            self.log_test("Activities Data", True, f"Found {count} activities")
        
        return success

    def test_payment_initiate(self):
        """Test payment initiation (should return mock response)"""
        if not self.token:
            self.log_test("Payment Initiate", False, "No token available")
            return False
            
        payment_data = {
            "plan": "creator",
            "amount": 500,
            "callback_url": "https://example.com/callback"
        }
        
        success, response = self.run_test(
            "Payment Initiate",
            "POST",
            "api/payments/initiate",
            200,
            data=payment_data
        )
        
        if success and response.get('mock'):
            self.log_test("Payment Mock Response", True, "Mock payment response received")
        elif success:
            self.log_test("Payment Mock Response", False, "Expected mock response")
        
        return success

    def test_transactions(self):
        """Test transactions endpoint"""
        if not self.token:
            self.log_test("Transactions", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            "api/payments/transactions",
            200
        )
        
        if success and 'transactions' in response:
            count = len(response['transactions'])
            self.log_test("Transactions Data", True, f"Found {count} transactions")
        
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Intermaven API Tests...")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Health check first
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Try demo login first, fallback to registration
        if not self.test_login():
            print("⚠️  Demo login failed, trying registration...")
            if not self.test_register():
                print("❌ Both login and registration failed - stopping tests")
                return False
        
        # Test authenticated endpoints
        self.test_get_me()
        self.test_user_stats()
        self.test_notifications()
        self.test_mark_notifications_read()
        self.test_profile_update()
        self.test_ai_generation()
        self.test_activities()
        self.test_payment_initiate()
        self.test_transactions()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            failed_tests = [r for r in self.test_results if not r['success']]
            print(f"❌ {len(failed_tests)} tests failed:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
            return False

def main():
    tester = Intermaven_API_Tester()
    success = tester.run_all_tests()
    
    # Save test results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': round(tester.tests_passed / tester.tests_run * 100, 2) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())