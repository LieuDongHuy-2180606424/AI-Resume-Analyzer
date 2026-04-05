from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from utils.pdf_extractor import extract_text_from_pdf
from utils.nlp_engine import analyze_matching
from utils.ai_analyzer import analyze_resume_with_ai, chat_with_ai
import uvicorn

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    cv_text: str
    jd: str
    question: str
    history: Optional[List[ChatMessage]] = []
    lang: Optional[str] = "en"

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    jd: str = Form(...),
    lang: str = Form(default="en")
):
    """Analyze CV in PDF format and compare it with the Job Description."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        cv_bytes = await file.read()
        cv_text = extract_text_from_pdf(cv_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
        
    if not cv_text or cv_text.startswith("Error"):
        raise HTTPException(status_code=422, detail="Unable to extract text from the PDF Resume.")
        
    basic_results = analyze_matching(cv_text, jd)
    
    try:
        ai_results = analyze_resume_with_ai(cv_text, jd, lang=lang)
    except Exception as e:
        print(f"CRITICAL AI ERROR: {str(e)}")
        ai_results = {"error": f"AI analysis failed: {str(e)}"}

    return {
        "basic": basic_results,
        "ai": ai_results,
        "cv_text": cv_text # Return CV text so frontend can use it for chat context
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    """Interactive chat with AI about the CV and JD."""
    try:
        # Convert Pydantic models to dicts for the utility function
        history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
        
        response = chat_with_ai(
            cv_text=request.cv_text,
            jd_text=request.jd,
            question=request.question,
            history=history_dicts,
            lang=request.lang
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API is running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
