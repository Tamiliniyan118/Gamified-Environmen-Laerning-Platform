#!/usr/bin/env python3
"""
GaiaQuest Complete Feature Test Suite
Demonstrates all new features with example HTTP requests and responses
"""

import subprocess
import sys
import time
import json
from pathlib import Path

# ANSI colors
GREEN = '\033[92m'
BLUE = '\033[94m'
CYAN = '\033[96m'
YELLOW = '\033[93m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_section(title):
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}{title:^70}{RESET}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")

def print_request(method, path, data=None):
    print(f"{BOLD}{BLUE}→ {method} {path}{RESET}")
    if data:
        print(f"  Body: {json.dumps(data, indent=2)}")

def print_response(status, data):
    print(f"{GREEN}← {status}{RESET}")
    print(f"  Response: {json.dumps(data, indent=2)}\n")

def print_example_curl(method, path, data=None, form_data=False):
    print(f"{YELLOW}PowerShell / Bash:{RESET}")
    if method == "GET":
        print(f"curl -X {method} http://localhost:3000{path}")
    elif form_data:
        print(f"curl -X {method} -F \"photo=@image.jpg\" http://localhost:3000{path}")
    else:
        json_str = json.dumps(data).replace('"', '\\"')
        print(f"curl -X {method} -H \"Content-Type: application/json\" \\")
        print(f"  -d '{json_str}' http://localhost:3000{path}")
    print()

def demo_email_routes():
    """Demonstrate email functionality"""
    print_section("📧 EMAIL INTEGRATION DEMO")
    
    print("GaiaQuest sends email notifications for:")
    print("  1. Welcome email on signup")
    print("  2. Submission accepted notifications")
    print("  3. Custom notifications\n")
    
    print(f"{BOLD}Endpoint: Test Email Configuration{RESET}")
    print_request("GET", "/api/user/test-email?to=your-email@gmail.com")
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "message": "Test email sent to your-email@gmail.com",
        "messageId": "<abc123@gmail.com>"
    }, indent=2))
    print()
    print_example_curl("GET", "/api/user/test-email?to=your-email@gmail.com")
    
    print(f"{BOLD}Endpoint: Send Welcome Email{RESET}")
    print_request("POST", "/api/user/welcome-email", {
        "email": "newuser@example.com",
        "userName": "EcoWarrior"
    })
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "messageId": "<welcome123@gmail.com>"
    }, indent=2))
    print()
    print_example_curl("POST", "/api/user/welcome-email", {
        "email": "newuser@example.com",
        "userName": "EcoWarrior"
    })
    
    print(f"{BOLD}Endpoint: Notify Submission Accepted{RESET}")
    print_request("POST", "/api/user/submission-accepted-email", {
        "email": "user@example.com",
        "userName": "EcoWarrior",
        "questTitle": "Plastic Cleanup Challenge",
        "xpAwarded": 50
    })
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "messageId": "<notif456@gmail.com>"
    }, indent=2))
    print()
    print_example_curl("POST", "/api/user/submission-accepted-email", {
        "email": "user@example.com",
        "userName": "EcoWarrior",
        "questTitle": "Plastic Cleanup Challenge",
        "xpAwarded": 50
    })

def demo_xai_routes():
    """Demonstrate XAI image verification"""
    print_section("🤖 AI IMAGE VERIFICATION DEMO")
    
    print("The XAI service verifies user submissions with:")
    print("  • Image classification (1000 ImageNet classes)")
    print("  • Confidence scoring")
    print("  • Grad-CAM saliency heatmaps")
    print("  • Feature importance explanations\n")
    
    print(f"{BOLD}Endpoint: Submit Image for Analysis{RESET}")
    print_request("POST", "/api/xai/submit", {
        "photo": "[multipart file]",
        "userId": "user123",
        "questId": "quest456"
    })
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "submission": {
            "id": "sub_abc123xyz",
            "userId": "user123",
            "questId": "quest456",
            "photoPath": "/uploads/submissions/abc123def.jpg",
            "saliencyPath": "/uploads/xai/abc123def-saliency.png",
            "aiLabel": "plastic_bag",
            "aiScore": 0.8234,
            "explanationSummary": "Detected: plastic bag (Confidence: 82.3%)",
            "timestamp": "2025-01-02T10:30:00.000Z"
        },
        "result": {
            "label": "plastic_bag",
            "score": 0.8234,
            "explanations": {
                "summary": "Detected: plastic bag (Confidence: 82.3%)",
                "reasons": [
                    "1. plastic_bag: 82.3%",
                    "2. shopping_bag: 12.5%",
                    "3. paper_bag: 5.2%"
                ],
                "saliencyUrl": "/uploads/xai/abc123def-saliency.png"
            }
        }
    }, indent=2))
    print()
    print_example_curl("POST", "/api/xai/submit", form_data=True)
    
    print(f"{BOLD}Endpoint: Get User Submissions{RESET}")
    print_request("GET", "/api/xai/submissions?userId=user123")
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "submissions": [
            {
                "id": "sub_abc123xyz",
                "userId": "user123",
                "questId": "quest456",
                "photoPath": "/uploads/submissions/abc123def.jpg",
                "saliencyPath": "/uploads/xai/abc123def-saliency.png",
                "aiLabel": "plastic_bag",
                "aiScore": 0.8234,
                "timestamp": "2025-01-02T10:30:00.000Z"
            }
        ]
    }, indent=2))
    print()
    print_example_curl("GET", "/api/xai/submissions?userId=user123")
    
    print(f"{BOLD}Endpoint: Get Specific Submission{RESET}")
    print_request("GET", "/api/xai/submission/sub_abc123xyz")
    print(f"{GREEN}Response:{RESET} 200 OK")
    print(json.dumps({
        "ok": True,
        "submission": {
            "id": "sub_abc123xyz",
            "userId": "user123",
            "questId": "quest456",
            "photoPath": "/uploads/submissions/abc123def.jpg",
            "saliencyPath": "/uploads/xai/abc123def-saliency.png",
            "aiLabel": "plastic_bag",
            "aiScore": 0.8234,
            "timestamp": "2025-01-02T10:30:00.000Z"
        }
    }, indent=2))
    print()
    print_example_curl("GET", "/api/xai/submission/sub_abc123xyz")

def demo_frontend_flow():
    """Demonstrate frontend camera integration"""
    print_section("📱 FRONTEND CAMERA INTEGRATION")
    
    print(f"{BOLD}Component: CameraCapture.jsx{RESET}\n")
    print("Location: frontend/src/components/CameraCapture.jsx")
    print("Provides: Real-time camera feed with capture and analysis\n")
    
    print("Features:")
    print("  ✓ Device camera access with permission handling")
    print("  ✓ Live video preview")
    print("  ✓ Photo capture to canvas")
    print("  ✓ Automatic upload to AI service")
    print("  ✓ Loading state with spinner")
    print("  ✓ Results display with:")
    print("    - Predicted label and confidence")
    print("    - Explanation of features")
    print("    - Saliency heatmap overlay")
    print("    - XP reward notification")
    print()
    
    print(f"{BOLD}Integration Points:{RESET}\n")
    print("1. LessonLayer.jsx - 'Use Camera' button")
    print("   → Opens CameraCapture modal")
    print("   → Handles results and updates state\n")
    
    print("2. Modules lesson pages")
    print("   → Can open CameraCapture for photo challenges\n")
    
    print("3. XP System")
    print("   → Calls addXp() on successful verification")
    print("   → Awards 25 XP if confidence > 70%\n")
    
    print(f"{BOLD}User Flow:{RESET}\n")
    print("1. User navigates to lesson with photo challenge")
    print("2. Clicks 'Use Camera' button")
    print("3. Browser requests camera permission")
    print("4. Video preview displays (facingMode: 'environment')")
    print("5. User clicks 'Capture Photo'")
    print("6. Preview of captured image shown")
    print("7. User clicks 'Submit'")
    print("8. Photo uploaded to /api/xai/submit")
    print("9. Python service processes with ResNet50")
    print("10. Results returned with saliency map")
    print("11. UI displays prediction, confidence, and heatmap")
    print("12. XP awarded if successful")

def demo_local_xai_service():
    """Demonstrate Python XAI service"""
    print_section("🐍 LOCAL PYTHON XAI SERVICE")
    
    print("Location: backend/local_xai/service.py")
    print("Port: 127.0.0.1:5001")
    print("Framework: Flask\n")
    
    print(f"{BOLD}Endpoints:{RESET}\n")
    
    print("1. POST /analyze - Image classification")
    print("   Input: Multipart form-data with 'photo' field")
    print("   Output: Classification + saliency map + explanation")
    print("   Time: ~1-2 seconds on CPU\n")
    
    print("2. GET /health - Service health check")
    print("   Output: { status, device, model_loaded }")
    print("   Time: <10ms\n")
    
    print(f"{BOLD}Technical Stack:{RESET}\n")
    print("  • PyTorch - Deep learning framework")
    print("  • torchvision - ResNet50 pretrained model")
    print("  • Captum - Grad-CAM saliency maps")
    print("  • Flask - REST API server")
    print("  • OpenCV - Image processing\n")
    
    print(f"{BOLD}Test Health Check:{RESET}\n")
    print("curl http://127.0.0.1:5001/health")
    print("Response: {\"status\":\"ok\",\"device\":\"cpu\",\"model_loaded\":true}\n")
    
    print(f"{BOLD}Saliency Map Generation:{RESET}\n")
    print("  • Input: Image + model logits")
    print("  • Method: Grad-CAM (Layer-wise Relevance Propagation)")
    print("  • Output: Heatmap overlay on original image")
    print("  • File: Saved to backend/uploads/xai/<filename>-saliency.png")
    print("  • Format: PNG with color-mapped importance scores")

def demo_database_records():
    """Show database record examples"""
    print_section("💾 DATABASE & FILE RECORDS")
    
    print(f"{BOLD}Submissions JSON Record:{RESET}\n")
    print("File: backend/data/submissions.json\n")
    print(json.dumps({
        "id": "sub_xyz789abc",
        "userId": "user_123",
        "questId": "quest_plastic_cleanup",
        "photoPath": "/uploads/submissions/xyz789abc_photo.jpg",
        "saliencyPath": "/uploads/xai/xyz789abc_photo-saliency.png",
        "aiLabel": "plastic_bottle",
        "aiScore": 0.9124,
        "explanationSummary": "Detected: plastic bottle (Confidence: 91.2%)",
        "timestamp": "2025-01-02T14:35:22.000Z"
    }, indent=2))
    print()
    
    print(f"{BOLD}File Organization:{RESET}\n")
    print("backend/uploads/")
    print("├── submissions/          # User uploaded photos")
    print("│   ├── abc123_photo.jpg")
    print("│   ├── def456_photo.jpg")
    print("│   └── ...\n")
    print("└── xai/                  # Generated saliency maps")
    print("    ├── abc123_photo-saliency.png")
    print("    ├── def456_photo-saliency.png")
    print("    └── ...\n")

def demo_rate_limiting():
    """Show rate limiting configuration"""
    print_section("⏱️ RATE LIMITING & SECURITY")
    
    print(f"{BOLD}Email Route Limiting:{RESET}\n")
    print("  • Max: 5 emails per minute per IP")
    print("  • Window: 60 seconds")
    print("  • Applies to:")
    print("    - /api/user/send-email")
    print("    - /api/user/welcome-email")
    print("    - /api/user/submission-accepted-email")
    print("    - /api/user/test-email\n")
    
    print(f"{BOLD}XAI Route Limiting:{RESET}\n")
    print("  • Max: 10 submissions per minute per IP")
    print("  • Window: 60 seconds")
    print("  • File size limit: 5 MB")
    print("  • Allowed types: JPEG, PNG, WebP\n")
    
    print(f"{BOLD}Exceeding Limits:{RESET}\n")
    print("Response: 429 Too Many Requests")
    print("Body: { message: 'Too many requests, please try again later' }\n")

def demo_environment_variables():
    """Show required environment variables"""
    print_section("🔐 ENVIRONMENT VARIABLES")
    
    print(f"{BOLD}Backend .env Configuration:{RESET}\n")
    print("""
# Server Configuration
PORT=3000
NODE_ENV=development

# Gmail SMTP Configuration (REQUIRED for email)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Local XAI Service URL
LOCAL_XAI_URL=http://127.0.0.1:5001

# Optional: OAuth2 for Gmail (if not using app password)
# GMAIL_OAUTH_CLIENT_ID=...
# GMAIL_OAUTH_CLIENT_SECRET=...
# GMAIL_OAUTH_REFRESH_TOKEN=...
""")
    
    print(f"{BOLD}Python Service Environment:{RESET}\n")
    print("""
# Optional: Force CPU or GPU
CUDA_VISIBLE_DEVICES=0        # 0 for GPU, -1 for CPU

# Optional: Model download location
TORCH_HOME=/path/to/cache    # Default: ~/.cache/torch
""")

def main():
    """Run complete feature demo"""
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}{'GaiaQuest - Complete Feature Implementation Demo':^70}{RESET}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")
    
    print("This script demonstrates all new features implemented:\n")
    print("  ✓ Email notifications via Gmail SMTP")
    print("  ✓ AI image verification with Grad-CAM saliency maps")
    print("  ✓ Real-time camera capture UI")
    print("  ✓ Backend integration and persistence\n")
    
    input(f"{YELLOW}Press Enter to begin demo...{RESET}")
    
    demo_email_routes()
    input(f"\n{YELLOW}Press Enter to continue to XAI routes...{RESET}")
    
    demo_xai_routes()
    input(f"\n{YELLOW}Press Enter to continue to frontend integration...{RESET}")
    
    demo_frontend_flow()
    input(f"\n{YELLOW}Press Enter to continue to Python service details...{RESET}")
    
    demo_local_xai_service()
    input(f"\n{YELLOW}Press Enter to continue to database records...{RESET}")
    
    demo_database_records()
    input(f"\n{YELLOW}Press Enter to continue to rate limiting...{RESET}")
    
    demo_rate_limiting()
    input(f"\n{YELLOW}Press Enter to continue to environment variables...{RESET}")
    
    demo_environment_variables()
    
    print_section("✨ DEMO COMPLETE")
    print(f"{GREEN}For more information, see:{RESET}\n")
    print("  • Main docs: FEATURE_IMPLEMENTATION_README.md")
    print("  • XAI docs: backend/local_xai/README.md")
    print("  • Test suite: backend/local_xai/test_service.py\n")
    print(f"{GREEN}To get started:{RESET}\n")
    print("  1. Configure backend/.env with Gmail credentials")
    print("  2. Start Python service: cd backend/local_xai && python service.py")
    print("  3. Start Node backend: cd backend && npm run dev")
    print("  4. Start frontend: cd frontend && npm run dev")
    print("  5. Open http://localhost:5173\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Demo interrupted by user.{RESET}\n")
        sys.exit(0)
