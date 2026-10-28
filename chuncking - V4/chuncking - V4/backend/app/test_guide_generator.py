import os
import sys

# Add the current directory to sys.path to resolve imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from guide_generator import generate_study_guide

def test_pdf_generation():
    output_pdf = "RAG_Chunking_Study_Guide.pdf"
    
    # Ensure any old test file is removed
    if os.path.exists(output_pdf):
        os.remove(output_pdf)
        
    print("Generating PDF Study Guide...")
    generate_study_guide(output_pdf)
    
    # Assertions
    assert os.path.exists(output_pdf), "PDF file was not created!"
    size = os.path.getsize(output_pdf)
    print(f"Success! PDF generated. File size: {size} bytes")
    assert size > 0, "PDF file is empty!"
    
    # Double-check Testleaf logo copy exists
    logo_path = os.path.join(os.path.dirname(__file__), "testleaf_logo.png")
    assert os.path.exists(logo_path), "testleaf_logo.png is missing from app directory!"
    print("Logo path confirmed.")

if __name__ == "__main__":
    try:
        test_pdf_generation()
        print("ALL TESTS PASSED.")
    except Exception as e:
        print(f"TEST FAILED: {str(e)}")
        sys.exit(1)
