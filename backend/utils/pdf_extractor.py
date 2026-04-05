import fitz
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF byte content."""
    text = ""
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return f"Error: {str(e)}"
    return text
