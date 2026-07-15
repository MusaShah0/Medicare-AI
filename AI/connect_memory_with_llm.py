import os

from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from dotenv import load_dotenv
load_dotenv()

# ===============================
# Step 1: Setup Groq LLM
# ===============================
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL_NAME = "llama-3.1-8b-instant"

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY not found in environment variables")

llm = ChatGroq(
    model=GROQ_MODEL_NAME,
    temperature=0.5,
    max_tokens=512,
    api_key=GROQ_API_KEY,
)

# ===============================
# Step 2: Load FAISS Vector Store
# ===============================
DB_FAISS_PATH = "vectorstore/db_faiss"

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = FAISS.load_local(
    DB_FAISS_PATH,
    embedding_model,
    allow_dangerous_deserialization=True
)

# ===============================
# Step 3: CUSTOM MEDICAL PROMPT
# ===============================
medical_analysis_prompt = ChatPromptTemplate.from_template("""
You are MediCare AI Assistant, a clinical decision-support tool designed to help patients understand their symptoms using evidence-based medical knowledge.

CRITICAL SAFETY RULES:
1. BASE ALL RESPONSES STRICTLY on the provided medical context below
2. NEVER provide definitive diagnoses - use language like "may suggest", "commonly associated with", "could indicate"
3. NEVER prescribe specific medications or dosages
4. NEVER replace professional medical judgment
5. If the context lacks sufficient information, clearly state "Based on available medical literature, I cannot provide specific guidance on this aspect"
6. If symptoms indicate EMERGENCY conditions (chest pain, severe bleeding, difficulty breathing, loss of consciousness, severe head injury, stroke symptoms), IMMEDIATELY and PROMINENTLY advise: 
   "⚠️ SEEK EMERGENCY MEDICAL CARE IMMEDIATELY - Call emergency services or go to the nearest emergency room"
7. Avoid medical jargon - explain in simple, patient-friendly language
8. Be empathetic and supportive in tone

MEDICAL KNOWLEDGE BASE:
{context}

PATIENT'S CONCERN:
{input}

Please provide a structured response in the following format:

### 📋 Understanding Your Symptoms

### 🔍 Possible Conditions

### 💊 General Treatment Approaches (Educational Information)

### 💉 Medications Commonly Used (For Information Only)

### 🏥 Precautionary Measures

### 👨‍⚕️ When to Seek Medical Care

### ⚕️ Next Steps Recommendation

---

⚠️ IMPORTANT MEDICAL DISCLAIMER:
This analysis is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
""")

# ===============================
# Step 4: Build RAG Chain
# ===============================
combine_docs_chain = create_stuff_documents_chain(
    llm=llm,
    prompt=medical_analysis_prompt
)

rag_chain = create_retrieval_chain(
    retriever=db.as_retriever(search_kwargs={"k": 3}),
    combine_docs_chain=combine_docs_chain
)

# ===============================
# Step 5: Run Chat Loop
# ===============================
print("\n🩺 MediCare AI Assistant is running")
print("Type 'exit', 'quit', or 'bye' to end the session\n")

while True:
    user_query = input("🩺 Enter your medical question: ").strip()

    if user_query.lower() in ["exit", "quit", "bye"]:
        print("\n👋 Session ended. Take care and stay healthy!")
        break

    response = rag_chain.invoke({"input": user_query})

    print("\n🧠 MEDICAL ANALYSIS:\n")
    print(response["answer"])

    print("\n📚 SOURCE DOCUMENTS:")
    for doc in response["context"]:
        print(f"- {doc.metadata.get('source', 'Unknown source')}")

    print("\n" + "="*60 + "\n")

