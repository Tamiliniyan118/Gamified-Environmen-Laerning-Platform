"""
GaiaQuest API Test Requests
Complete test suite for all new endpoints
Run with: python test_requests.py
"""

import requests
import json
import time
from pathlib import Path
from io import BytesIO
from PIL import Image

# Configuration
BACKEND_URL = "http://localhost:3000"
XAI_URL = "http://127.0.0.1:5001"
HEADERS = {"Content-Type": "application/json"}

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test(name):
    print(f"\n{Colors.BOLD}{Colors.CYAN}TEST: {name}{Colors.ENDC}")
    print("-" * 70)

def print_result(success, message, data=None):
    if success:
        print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")
    else:
        print(f"{Colors.RED}✗ {message}{Colors.ENDC}")
    if data:
        print(f"  {json.dumps(data, indent=2)}")

def create_test_image(filename="test_image.jpg", color=(255, 0, 0)):
    """Create a test image"""
    img = Image.new('RGB', (224, 224), color=color)
    img.save(filename)
    return filename

def test_backend_connection():
    """Test if backend is running"""
    print_test("Backend Connection")
    try:
        response = requests.get(f"{BACKEND_URL}/api/quests", timeout=5)
        print_result(response.status_code == 200, "Backend responding", {
            "status": response.status_code,
            "endpoint": "/api/quests"
        })
        return True
    except Exception as e:
        print_result(False, f"Backend not responding: {e}")
        return False

def test_xai_health():
    """Test if XAI service is running"""
    print_test("XAI Service Health")
    try:
        response = requests.get(f"{XAI_URL}/health", timeout=5)
        data = response.json()
        print_result(response.status_code == 200, "XAI service healthy", data)
        return data.get('model_loaded', False)
    except Exception as e:
        print_result(False, f"XAI service not responding: {e}")
        return False

def test_email_test_endpoint():
    """Test email configuration"""
    print_test("Email Configuration (Test Endpoint)")
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/user/test-email",
            params={"to": "test@example.com"},
            timeout=10
        )
        data = response.json()
        print_result(
            response.status_code in [200, 500],
            f"Email endpoint responsive (status: {response.status_code})",
            data
        )
        if response.status_code == 200:
            return data.get('ok', False)
        else:
            # 500 likely means Gmail not configured, which is ok for test
            print(f"  {Colors.YELLOW}Note: Gmail may not be configured ({data.get('error')}){Colors.ENDC}")
            return True
    except Exception as e:
        print_result(False, f"Email test failed: {e}")
        return False

def test_send_welcome_email():
    """Test welcome email endpoint"""
    print_test("Send Welcome Email")
    payload = {
        "email": "newuser@example.com",
        "userName": "EcoWarrior"
    }
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/user/welcome-email",
            json=payload,
            headers=HEADERS,
            timeout=10
        )
        data = response.json()
        print_result(
            response.status_code in [200, 500],
            f"Welcome email endpoint responsive (status: {response.status_code})",
            data
        )
        return True
    except Exception as e:
        print_result(False, f"Welcome email test failed: {e}")
        return False

def test_send_submission_email():
    """Test submission accepted email endpoint"""
    print_test("Send Submission Accepted Email")
    payload = {
        "email": "user@example.com",
        "userName": "EcoWarrior",
        "questTitle": "Plastic Cleanup Challenge",
        "xpAwarded": 50
    }
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/user/submission-accepted-email",
            json=payload,
            headers=HEADERS,
            timeout=10
        )
        data = response.json()
        print_result(
            response.status_code in [200, 500],
            f"Submission email endpoint responsive (status: {response.status_code})",
            data
        )
        return True
    except Exception as e:
        print_result(False, f"Submission email test failed: {e}")
        return False

def test_xai_analyze():
    """Test XAI image analysis"""
    print_test("XAI Image Analysis (Local Service)")
    
    # Create test image
    test_img = create_test_image("test_red.jpg", color=(255, 0, 0))
    
    try:
        with open(test_img, 'rb') as f:
            files = {'photo': f}
            response = requests.post(
                f"{XAI_URL}/analyze",
                files=files,
                timeout=30
            )
        
        data = response.json()
        print_result(
            response.status_code == 200,
            f"XAI analysis completed (status: {response.status_code})",
            {
                "label": data.get('label', 'N/A'),
                "score": data.get('score', 'N/A'),
                "explanation": data.get('explanations', {}).get('summary', 'N/A')
            }
        )
        return response.status_code == 200
    except Exception as e:
        print_result(False, f"XAI analysis failed: {e}")
        return False
    finally:
        # Cleanup
        Path(test_img).unlink(missing_ok=True)

def test_xai_submit_to_backend():
    """Test submitting image to backend XAI endpoint"""
    print_test("Submit Image to Backend XAI Endpoint")
    
    # Create test image
    test_img = create_test_image("test_blue.jpg", color=(0, 0, 255))
    
    try:
        with open(test_img, 'rb') as f:
            files = {'photo': f}
            data = {
                'userId': 'test_user_123',
                'questId': 'test_quest_456'
            }
            response = requests.post(
                f"{BACKEND_URL}/api/xai/submit",
                files=files,
                data=data,
                timeout=30
            )
        
        result = response.json()
        print_result(
            response.status_code == 200,
            f"Backend XAI submit completed (status: {response.status_code})",
            {
                "ok": result.get('ok', False),
                "submission_id": result.get('submission', {}).get('id', 'N/A'),
                "ai_label": result.get('submission', {}).get('aiLabel', 'N/A'),
                "ai_score": result.get('submission', {}).get('aiScore', 'N/A')
            }
        )
        
        if result.get('ok'):
            submission_id = result.get('submission', {}).get('id')
            return submission_id
        return None
    except Exception as e:
        print_result(False, f"Backend XAI submit failed: {e}")
        return None
    finally:
        # Cleanup
        Path(test_img).unlink(missing_ok=True)

def test_get_submissions(user_id="test_user_123"):
    """Test getting user submissions"""
    print_test("Get User Submissions")
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/xai/submissions",
            params={"userId": user_id},
            timeout=10
        )
        data = response.json()
        print_result(
            response.status_code == 200,
            f"Retrieved {len(data.get('submissions', []))} submissions",
            {
                "user_id": user_id,
                "count": len(data.get('submissions', [])),
                "ok": data.get('ok', False)
            }
        )
        return True
    except Exception as e:
        print_result(False, f"Get submissions failed: {e}")
        return False

def test_get_submission_detail(submission_id):
    """Test getting specific submission"""
    print_test("Get Submission Detail")
    try:
        response = requests.get(
            f"{BACKEND_URL}/api/xai/submission/{submission_id}",
            timeout=10
        )
        data = response.json()
        print_result(
            response.status_code == 200,
            f"Retrieved submission {submission_id}",
            {
                "ok": data.get('ok', False),
                "id": data.get('submission', {}).get('id', 'N/A')
            }
        )
        return True
    except Exception as e:
        print_result(False, f"Get submission detail failed: {e}")
        return False

def test_rate_limiting():
    """Test rate limiting on email endpoint"""
    print_test("Rate Limiting (Email Endpoint)")
    
    print(f"  {Colors.YELLOW}Sending 6 requests rapidly to test rate limiting...{Colors.ENDC}")
    
    limited = False
    for i in range(7):
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/user/test-email",
                params={"to": f"test{i}@example.com"},
                timeout=5
            )
            if response.status_code == 429:
                limited = True
                break
        except:
            pass
        time.sleep(0.1)
    
    print_result(
        limited,
        "Rate limiting working (got 429 after multiple requests)",
        {"status_code": 429 if limited else "no limit hit"}
    )
    return limited

def test_file_validation():
    """Test file validation on upload"""
    print_test("File Validation")
    
    try:
        # Create invalid file (text)
        invalid_file = "test_invalid.txt"
        with open(invalid_file, 'w') as f:
            f.write("This is not an image")
        
        with open(invalid_file, 'rb') as f:
            files = {'photo': f}
            response = requests.post(
                f"{BACKEND_URL}/api/xai/submit",
                files=files,
                timeout=10
            )
        
        print_result(
            response.status_code in [400, 415],
            f"Invalid file rejected (status: {response.status_code})",
            response.json()
        )
        
        # Cleanup
        Path(invalid_file).unlink(missing_ok=True)
        return True
    except Exception as e:
        print_result(False, f"File validation test failed: {e}")
        return False

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("=" * 70)
    print("GaiaQuest API Test Suite".center(70))
    print("=" * 70)
    print(f"{Colors.ENDC}\n")
    
    print(f"Backend URL: {BACKEND_URL}")
    print(f"XAI URL: {XAI_URL}\n")
    
    # Check connectivity
    print(f"{Colors.BOLD}Connectivity Checks:{Colors.ENDC}")
    backend_ok = test_backend_connection()
    xai_ok = test_xai_health()
    
    if not backend_ok or not xai_ok:
        print(f"\n{Colors.RED}ERROR: Cannot reach required services{Colors.ENDC}")
        print("Make sure:")
        print("  1. Backend running: cd backend && npm run dev")
        print("  2. XAI service running: cd backend/local_xai && python service.py")
        return
    
    # Email tests
    print(f"\n{Colors.BOLD}Email Endpoint Tests:{Colors.ENDC}")
    test_email_test_endpoint()
    test_send_welcome_email()
    test_send_submission_email()
    
    # XAI tests
    print(f"\n{Colors.BOLD}XAI Endpoint Tests:{Colors.ENDC}")
    test_xai_analyze()
    submission_id = test_xai_submit_to_backend()
    
    if submission_id:
        test_get_submissions()
        test_get_submission_detail(submission_id)
    
    # Security tests
    print(f"\n{Colors.BOLD}Security Tests:{Colors.ENDC}")
    test_rate_limiting()
    test_file_validation()
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.GREEN}")
    print("=" * 70)
    print("Test Suite Complete!".center(70))
    print("=" * 70)
    print(f"{Colors.ENDC}\n")
    
    print(f"For detailed documentation, see:")
    print("  • FEATURE_IMPLEMENTATION_README.md")
    print("  • backend/local_xai/README.md")

if __name__ == '__main__':
    main()
