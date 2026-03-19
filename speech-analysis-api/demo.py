# API Health Check Script
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def check_health():
    """Check if API is healthy"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            print(json.dumps(response.json(), indent=2))
            return True
    except Exception as e:
        print(f"❌ API is not available: {e}")
        return False

def analyze_audio(file_path):
    """Send audio for analysis"""
    if not check_health():
        print("Please start the API server first")
        return
    
    print(f"\n📤 Uploading {file_path}...")
    with open(file_path, 'rb') as f:
        files = {'file': f}
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/analyze",
                files=files
            )
            
            if response.status_code == 200:
                data = response.json()['data']
                
                print("\n✅ Analysis Complete!")
                print(f"\n📋 Transcript:\n{data['transcript']}")
                print(f"\n⏱️  Duration: {data['duration']:.1f}s")
                
                rc = data['report_card']
                print(f"\n📊 Report Card:")
                print(f"  Overall Score: {rc['overall_score']}/100")
                print(f"  Pacing: {rc['pacing']['score']}/100 ({rc['pacing']['wpm']} WPM)")
                print(f"  Expressiveness: {rc['expressiveness']['score']}/100")
                print(f"  Clarity: {rc['clarity']['score']}/100")
                
                print(f"\n💬 Pauses Detected: {len(data['pauses'])}")
                for i, pause in enumerate(data['pauses'][:3], 1):
                    print(f"  {i}. {pause['label']} ({pause['duration']:.2f}s) - " +
                          f"between '{pause['context_before']}' and '{pause['context_after']}'")
                
                print(f"\n🤖 LLM Feedback:\n{data['feedback'][:500]}...")
                print(f"\n📈 Generated {len(data['graphs'])} graphs")
                
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.json())
        
        except Exception as e:
            print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python demo.py health              # Check API health")
        print("  python demo.py analyze <audio.wav> # Analyze audio file")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "health":
        check_health()
    elif command == "analyze" and len(sys.argv) > 2:
        analyze_audio(sys.argv[2])
    else:
        print("❌ Invalid command")
