import sys
from pathlib import Path

# Ensure backend root directory is in sys.path for Vercel Serverless environment
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Vercel entrypoint
export_app = app
