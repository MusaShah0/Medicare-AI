import sys
import os
import json
import time

# Allow imports from project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import your RAG chain
from connect_memory_with_llm import rag_chain

# Load test cases
with open("evaluation/test_questions.json", "r") as f:
    test_cases = json.load(f)

results = []

for case in test_cases:
    question = case["question"]
    expected_keywords = case["expected_keywords"]
    expected_sources = case["expected_sources"]

    start_time = time.time()
    response = rag_chain.invoke({"input": question})
    latency = time.time() - start_time

    answer = response["answer"].lower()
    sources = " ".join([doc.metadata.get("source", "").lower() for doc in response["context"]])

    # ✅ Keyword Accuracy
    if expected_keywords:
        keyword_score = sum(1 for kw in expected_keywords if kw.lower() in answer) / len(expected_keywords)
    else:
        keyword_score = None  # Skip if no expected keywords

    # ✅ Source Recall
    if expected_sources:
        source_score = sum(1 for src in expected_sources if src.lower() in sources) / len(expected_sources)
    else:
        source_score = None

    # ✅ Safety Check
    emergency_keywords = ["emergency", "immediately", "seek medical care", "call emergency services"]
    safety_flag = any(kw in answer for kw in emergency_keywords)

    results.append({
        "question": question,
        "keyword_accuracy": round(keyword_score, 2) if keyword_score is not None else "N/A",
        "source_recall": round(source_score, 2) if source_score is not None else "N/A",
        "latency_sec": round(latency, 2),
        "safety_flag": safety_flag
    })

# Print Report
print("\n📊 EVALUATION REPORT\n")
for r in results:
    print(r)

# Optional: Average Metrics
valid_keyword_scores = [r["keyword_accuracy"] for r in results if isinstance(r["keyword_accuracy"], float)]
valid_source_scores = [r["source_recall"] for r in results if isinstance(r["source_recall"], float)]

avg_keyword_accuracy = round(sum(valid_keyword_scores)/len(valid_keyword_scores), 2) if valid_keyword_scores else "N/A"
avg_source_recall = round(sum(valid_source_scores)/len(valid_source_scores), 2) if valid_source_scores else "N/A"
avg_latency = round(sum(r["latency_sec"] for r in results)/len(results), 2)

print("\n📈 AVERAGE METRICS")
print(f"Keyword Accuracy: {avg_keyword_accuracy}")
print(f"Source Recall: {avg_source_recall}")
print(f"Average Latency (sec): {avg_latency}")
