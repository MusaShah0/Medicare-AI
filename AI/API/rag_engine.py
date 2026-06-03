import os
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class MedicalRAG:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.3, # Slightly lower for more factual medical responses
            api_key=os.environ.get("GROQ_API_KEY"),
        )
        self.db = self._load_vector_store()
        self.rag_chain = self._build_rag_chain()

    def _load_vector_store(self):
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        return FAISS.load_local("vectorstore/db_faiss", embeddings, allow_dangerous_deserialization=True)

    def _build_rag_chain(self):
        # 1. Contextualize Question Prompt
        # This sub-chain rephrases the user's question to be standalone if history exists
        contextualize_q_system_prompt = (
            "Given a chat history and the latest user question "
            "which might reference context in the chat history, "
            "formulate a standalone question which can be understood "
            "without the chat history. Do NOT answer the question, "
            "just reformulate it if needed and otherwise return it as is."
        )
        contextualize_q_prompt = ChatPromptTemplate.from_messages([
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        
        history_aware_retriever = create_history_aware_retriever(
            self.llm, self.db.as_retriever(search_kwargs={"k": 3}), contextualize_q_prompt
        )

        # 2. Main Medical Answer Prompt
        system_prompt = (
    "You are MediCare AI Assistant, a clinical decision-support tool designed to help patients "
    "understand their symptoms using evidence-based medical knowledge.\n\n"

    "CRITICAL SAFETY RULES:\n"
    "1. Base all responses STRICTLY on the provided medical context below.\n"
    "2. NEVER provide definitive diagnoses. Use cautious language such as "
    "'may suggest', 'commonly associated with', or 'could indicate'.\n"
    "3. NEVER prescribe specific medications or dosages.\n"
    "4. NEVER replace professional medical judgment.\n"
    "5. If the context lacks sufficient information, clearly state:\n"
    "\"Based on available medical literature, I cannot provide specific guidance on this aspect.\"\n"
    "6. If symptoms indicate EMERGENCY conditions (including chest pain, severe bleeding, "
    "difficulty breathing, loss of consciousness, severe head injury, or stroke symptoms), "
    "IMMEDIATELY and PROMINENTLY advise:\n"
    "\"⚠️ SEEK EMERGENCY MEDICAL CARE IMMEDIATELY - Call emergency services or go to the nearest emergency room\"\n"
    "7. Avoid medical jargon and explain in clear, patient-friendly language.\n"
    "8. Maintain an empathetic and supportive tone.\n\n"

    "MEDICAL KNOWLEDGE BASE (Retrieved Context):\n"
    "{context}\n\n"

    "You MUST respond using the following structure:\n\n"
    "### 📋 Understanding Your Symptoms\n\n"
    "### 🔍 Possible Conditions\n\n"
    "### 💊 General Treatment Approaches (Educational Information Only)\n\n"
    "### 💉 Medications Commonly Used (For Information Only – No Dosages)\n\n"
    "### 🏥 Precautionary Measures\n\n"
    "### 👨‍⚕️ When to Seek Medical Care\n\n"
    "### ⚕️ Next Steps Recommendation\n\n"
    "---\n\n"
    "⚠️ IMPORTANT MEDICAL DISCLAIMER:\n"
    "This analysis is for educational purposes only and does not constitute medical advice, "
    "diagnosis, or treatment. Always consult a qualified healthcare professional."
)
        
        qa_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

        question_answer_chain = create_stuff_documents_chain(self.llm, qa_prompt)
        
        # The final chain combining retrieval and the QA chain
        return create_retrieval_chain(history_aware_retriever, question_answer_chain)

    # Greeting keywords — respond warmly, no RAG needed
    _GREETINGS = {
        # English
        "hi", "hello", "hey", "hii", "helo", "heya", "howdy",
        "how are you", "how r u", "how are u", "whats up", "what's up",
        "good morning", "good afternoon", "good evening", "good night",
        "sup", "yo", "greetings",

    }

    # Keywords that signal clearly off-topic (non-medical) questions
    # NOTE: keep these specific to avoid blocking medical queries in other languages
    _OFF_TOPIC_SIGNALS = [
        "capital of", "president of", "prime minister", "currency of",
        "population of", "largest country", "tallest mountain", "deepest ocean",
        "who invented", "when was", "history of", "what year did",
        "movie", "actor", "actress", "song", "music", "cricket", "football",
        "recipe", "cook", "restaurant", "weather", "temperature today",
        "stock", "share price", "bitcoin", "crypto", "politics", "election",
        "what is the capital", "translate this",
    ]

    def _clean_source(self, raw: str) -> str:
        """Return just the PDF filename without path segments."""
        import os
        return os.path.basename(raw)

    def _is_greeting(self, query: str) -> bool:
        q = query.strip().lower().rstrip("!?.,")
        return q in self._GREETINGS or any(q.startswith(g) for g in self._GREETINGS)

    def _is_off_topic(self, query: str) -> bool:
        q = query.lower()
        return any(signal in q for signal in self._OFF_TOPIC_SIGNALS)

    async def get_medical_answer(self, query: str, chat_history: list):
        # ── Greeting shortcut ──────────────────────────────────────────────────
        if self._is_greeting(query):
            answer = (
                "Hello! 👋 I'm **MediCare AI**, your medical assistant.\n\n"
                "I'm here to help you understand symptoms, possible conditions, "
                "and when to seek medical care — all based on verified medical literature.\n\n"
                "Please describe your symptoms, and I'll do my best to help. 🏥"
            )
            return {"answer": answer, "sources": []}

        # ── Off-topic filter ───────────────────────────────────────────────────
        if self._is_off_topic(query):
            return {
                "answer": (
                    "I'm sorry, but your question doesn't appear to be related to medical or health topics. 🏥\n\n"
                    "I'm **MediCare AI**, a clinical assistant specialised in helping you understand "
                    "symptoms, conditions, and healthcare guidance.\n\n"
                    "Please ask me a health-related question — for example:\n"
                    "- *\"I have a persistent headache and fever, what could it be?\"*\n"
                    "- *\"What are the symptoms of diabetes?\"*\n"
                    "- *\"When should chest pain be considered an emergency?\"*"
                ),
                "sources": [],
            }

        # ── Normal RAG flow ────────────────────────────────────────────────────
        response = self.rag_chain.invoke({
            "input": query,
            "chat_history": chat_history
        })
        raw_sources = [doc.metadata.get("source", "") for doc in response["context"]]
        clean_sources = list(dict.fromkeys(
            self._clean_source(s) for s in raw_sources if s
        ))
        return {
            "answer": response["answer"],
            "sources": clean_sources,
        }