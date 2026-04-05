import re
from typing import List, Set, Dict, Any

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", 
    "from", "by", "for", "with", "about", "against", "between", "into", "through", 
    "during", "before", "after", "above", "below", "to", "up", "down", "in", "out", 
    "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "all", "any", "both", "each", "few", "more", "most", "other", "some", 
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very"
}

def clean_text(text: str) -> str:
    """Basic cleaning: remove special characters, lower case."""
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    return text.lower()

def extract_keywords(text: str) -> Set[str]:
    """Extract potential keywords from text by filtering out stop words and short tokens."""
    cleaned = clean_text(text)
    tokens = cleaned.split()
    keywords = {t for t in tokens if len(t) > 2 and t not in STOP_WORDS and not t.isdigit()}
    return keywords

def analyze_matching(cv_text: str, jd_text: str) -> Dict[str, Any]:
    """Compare CV and JD to find match percentage and missing keywords."""
    cv_keywords = extract_keywords(cv_text)
    jd_keywords = extract_keywords(jd_text)
    
    matched_keywords = jd_keywords.intersection(cv_keywords)
    missing_keywords = jd_keywords - cv_keywords
    
    match_percentage = 0
    if jd_keywords:
        match_percentage = (len(matched_keywords) / len(jd_keywords)) * 100
        
    return {
        "match_percentage": round(match_percentage, 1),
        "matched_keywords": sorted(list(matched_keywords)),
        "missing_keywords": sorted(list(missing_keywords)),
        "total_jd_keywords": len(jd_keywords),
        "matched_count": len(matched_keywords)
    }
