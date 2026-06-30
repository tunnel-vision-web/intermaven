import pytest
import requests
import os
import random

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')

class TestMpesaPayments:
    """Integration tests for M-Pesa POS payments"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_email = f"test_payment_{random.randint(10000, 99999)}@example.com"
        self.test_password = "TestPassword123!"
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register test user
        reg_res = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "first_name": "Pay",
            "last_name": "Test",
            "phone": "254712345678",
            "portal": "music"
        })
        assert reg_res.status_code == 200
        self.token = reg_res.json()["access_token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
        
    def test_mpesa_checkout_flow(self):
        """Test M-Pesa STK Push -> Status Polling -> Callback Completion"""
        # 1. Trigger STK Push request
        push_res = self.session.post(
            f"{BASE_URL}/api/payments/mpesa/stkpush",
            json={
                "phone": "254712345678",
                "amount": 250,
                "item": "VIP Concert Ticket (no-simulate)"
            },
            headers=self.auth_headers
        )
        assert push_res.status_code == 200
        push_data = push_res.json()
        assert push_data["success"] is True
        checkout_req_id = push_data["checkout_request_id"]
        assert checkout_req_id is not None
        
        # 2. Check initial pending status
        status_res = self.session.get(
            f"{BASE_URL}/api/payments/mpesa/status/{checkout_req_id}",
            headers=self.auth_headers
        )
        assert status_res.status_code == 200
        status_data = status_res.json()
        assert status_data["status"] == "pending"
        assert status_data["amount"] == 250
        assert status_data["item"] == "VIP Concert Ticket (no-simulate)"
        
        # 3. Simulate callback from Safaricom Daraja
        callback_payload = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "12345-67890-1",
                    "CheckoutRequestID": checkout_req_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 250},
                            {"Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV"},
                            {"Name": "PhoneNumber", "Value": 254712345678}
                        ]
                    }
                }
            }
        }
        callback_res = self.session.post(
            f"{BASE_URL}/api/payments/mpesa/callback",
            json=callback_payload
        )
        assert callback_res.status_code == 200
        assert callback_res.json()["success"] is True
        
        # 4. Check completed status
        status_res_2 = self.session.get(
            f"{BASE_URL}/api/payments/mpesa/status/{checkout_req_id}",
            headers=self.auth_headers
        )
        assert status_res_2.status_code == 200
        assert status_res_2.json()["status"] == "completed"
        
        # 5. Verify user received credits
        stats_res = self.session.get(
            f"{BASE_URL}/api/user/stats",
            headers=self.auth_headers
        )
        assert stats_res.status_code == 200
        # 150 default registration credits + 250 purchased credits = 400
        assert stats_res.json()["credits"] == 400
        print("✓ M-Pesa POS collection flow verified successfully!")
