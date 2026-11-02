import sys
import os
import uvicorn

# Ensure the backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"🚀 [Quantum Tumor Engine] Starting Uvicorn on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
