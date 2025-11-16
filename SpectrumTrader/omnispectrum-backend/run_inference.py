#!/usr/bin/env python3
"""
Omnispectrum Backend Inference Wrapper
Designed to be called from Node.js
"""
import sys
import json
from pathlib import Path

# Add parent directory to path to import src module
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

try:
    from src.inference import run_inference
    
    # Determine output path
    output_dir = backend_dir / "data"
    output_path = str(output_dir / "omnispectrum.json")
    
    # Run inference
    print(f"Starting inference, output will be saved to: {output_path}")
    run_inference(output_path=output_path)
    
    # Return success with file path
    result = {
        "status": "success",
        "output_path": output_path,
        "message": "Inference completed successfully"
    }
    print(json.dumps(result))
    sys.exit(0)
    
except ImportError as e:
    error_result = {
        "status": "error",
        "error_type": "ImportError",
        "message": f"Failed to import inference module: {str(e)}",
        "note": "Make sure all Python dependencies are installed: pip install -r requirements.txt"
    }
    print(json.dumps(error_result), file=sys.stderr)
    sys.exit(1)
    
except Exception as e:
    error_result = {
        "status": "error",
        "error_type": type(e).__name__,
        "message": str(e),
    }
    print(json.dumps(error_result), file=sys.stderr)
    sys.exit(1)
