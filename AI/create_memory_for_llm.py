import os
from dotenv import load_dotenv
load_dotenv()

from langchain_community.document_loaders import DirectoryLoader, PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


# =========================
# Step 1: Load PDF files
# =========================
DATA_PATH = "data/"

def load_pdf_files(data_path):
    loader = DirectoryLoader(
        data_path,
        glob="*.pdf",
        loader_cls=PyMuPDFLoader   # 🔥 FIX HERE
    )
    documents = loader.load()
    return documents


documents = load_pdf_files(DATA_PATH)
print(f"Loaded {len(documents)} pages")


# =========================
# Step 2: Create Chunks
# =========================
def create_chunks(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(documents)


text_chunks = create_chunks(documents)
print(f"Created {len(text_chunks)} text chunks")


# =========================
# Step 3: Embedding Model
# =========================
def get_embedding_model():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


embedding_model = get_embedding_model()


# =========================
# Step 4: Store in FAISS
# =========================
DB_FAISS_PATH = "vectorstore/db_faiss"
os.makedirs(DB_FAISS_PATH, exist_ok=True)

db = FAISS.from_documents(text_chunks, embedding_model)
db.save_local(DB_FAISS_PATH)

print("✅ FAISS vector store created successfully")
