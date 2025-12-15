import streamlit as st
import pdfplumber
import re
import random

# -----------------------------
# Text utility functions
# -----------------------------

STOPWORDS = set("""
a an the is am are was were this that these those and or but if in on at for with by to from of as it its be has have had
do does did so such than then very can could will would should about into over under again more most other only same own
""".split())


def clean_text(text):
    return re.sub(r"\s+", " ", text).strip() if text else ""


def split_sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def build_word_freq(text):
    freq = {}
    for w in re.findall(r"\w+", text.lower()):
        if w not in STOPWORDS:
            freq[w] = freq.get(w, 0) + 1
    return freq


def summarize_text(text, limit=7):
    text = clean_text(text)
    sentences = split_sentences(text)
    if len(sentences) <= limit:
        return text

    freq = build_word_freq(text)
    scores = {s: sum(freq.get(w, 0) for w in re.findall(r"\w+", s.lower())) for s in sentences}
    best = sorted(scores, key=scores.get, reverse=True)[:limit]
    return " ".join([s for s in sentences if s in best])


def prepare_chunks(text, size=180):
    words = text.split()
    return [" ".join(words[i:i + size]) for i in range(0, len(words), size)]


def find_best_answer(q, text):
    if not text:
        return "Upload a PDF first."

    q_words = [w for w in re.findall(r"\w+", q.lower()) if w not in STOPWORDS]
    chunks = prepare_chunks(text)

    best, score_best = None, -1
    for chunk in chunks:
        c_words = set(re.findall(r"\w+", chunk.lower()))
        score = sum(w in c_words for w in q_words)
        if score > score_best:
            best, score_best = chunk, score

    return f"> {best}" if score_best > 0 else "I couldn't find that in the PDF."


def generate_qa_pairs(text, num=5):
    text = clean_text(text)
    sentences = split_sentences(text)
    if not sentences:
        return []

    freq = build_word_freq(text)
    scores = {s: sum(freq.get(w, 0) for w in re.findall(r"\w+", s.lower())) for s in sentences}

    sorted_s = sorted(scores, key=scores.get, reverse=True)
    qa = []

    for s in sorted_s:
        keywords = [w for w in re.findall(r"\w+", s) if len(w) > 4 and w.lower() not in STOPWORDS]
        if keywords:
            kw = max(keywords, key=len)
            qa.append((kw, s))
        if len(qa) == num:
            break

    return qa


def extract_text(pdf):
    full = ""
    try:
        with pdfplumber.open(pdf) as p:
            for pg in p.pages:
                full += (pg.extract_text() or "") + "\n"
    except:
        return ""
    return clean_text(full)


# -----------------------------
# Streamlit App Setup
# -----------------------------

st.set_page_config(layout="wide", page_title="Smart PDF Chat", page_icon="💬")

# Theme state
if "theme" not in st.session_state:
    st.session_state.theme = "Dark"

# Chat state
if "chat" not in st.session_state:
    st.session_state.chat = [
        {"role": "assistant", "msg": "Hi! Upload a PDF and ask me anything about it."}
    ]

if "pdf_text" not in st.session_state:
    st.session_state.pdf_text = ""


# -------------------------------
# Sidebar
# -------------------------------
with st.sidebar:
    st.title("⚙ Settings")

    theme_choice = st.radio("Theme", ["Dark", "Light"])
    st.session_state.theme = theme_choice

    st.subheader("📄 Upload PDF")
    pdf = st.file_uploader("Choose PDF", type=["pdf"])
    if pdf:
        st.session_state.pdf_text = extract_text(pdf)
        st.success("PDF uploaded!")

    st.markdown("---")
    st.markdown("**Try asking:**")
    st.markdown(
        "- summarize this pdf\n"
        "- give me important questions\n"
        "- explain deadlock\n"
        "- what is TCP?\n"
    )

# -------------------------------
# Apply THEME CSS (fully updated)
# -------------------------------

if st.session_state.theme == "Dark":
    st.markdown("""
    <style>
        body {
            background-color: #0d0d0d !important;
            color: #ffffff !important;
        }
        .stApp {
            background-color: #0d0d0d !important;
        }
        .sidebar .sidebar-content {
            background-color: #000000 !important;
        }
        .assistant {
            background: #1e1e1e;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 8px;
            color: white;
        }
        .user {
            background: #0b93f6;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 8px;
            color: white;
            text-align: right;
        }
        .stChatInputContainer textarea {
            color: white !important;
            background-color: #1e1e1e !important;
        }
    </style>
    """, unsafe_allow_html=True)

else:  # LIGHT THEME
    st.markdown("""
    <style>
        body {
            background-color: #f7f7f8 !important;
            color: black !important;
        }
        .stApp {
            background-color: #f7f7f8 !important;
        }
        .assistant {
            background: #e5e7eb;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 8px;
        }
        .user {
            background: #10a37f;
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 8px;
            color: white;
            text-align: right;
        }
        .stChatInputContainer textarea {
            color: black !important;
            background-color: white !important;
        }
    </style>
    """, unsafe_allow_html=True)

# -------------------------------
# MAIN CHAT UI
# -------------------------------

st.title("💬 Smart PDF Chat")

container = st.container()
with container:
    for msg in st.session_state.chat:
        css = "assistant" if msg["role"] == "assistant" else "user"
        st.markdown(f"<div class='{css}'>{msg['msg']}</div>", unsafe_allow_html=True)

# -------------------------------
# Chat Input
# -------------------------------

user_input = st.chat_input("Ask something...")

if user_input:
    st.session_state.chat.append({"role": "user", "msg": user_input})

    q = user_input.lower()

    # Check commands
    if "summary" in q:
        if st.session_state.pdf_text:
            ans = summarize_text(st.session_state.pdf_text)
        else:
            ans = "Upload PDF first."

    elif "important question" in q or "generate question" in q:
        if st.session_state.pdf_text:
            qa = generate_qa_pairs(st.session_state.pdf_text)
            ans = "\n".join([f"Q{i+1}: {q}\nA: {a}" for i, (q, a) in enumerate(qa)])
        else:
            ans = "Upload PDF first."

    else:
        if st.session_state.pdf_text:
            ans = find_best_answer(user_input, st.session_state.pdf_text)
        else:
            ans = "Upload a PDF and I will answer from it."

    st.session_state.chat.append({"role": "assistant", "msg": ans})
    st.rerun()
