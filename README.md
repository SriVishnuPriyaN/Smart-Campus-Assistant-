# 🎓 Smart Campus Assistant

## 📌 Project Title
**Smart Campus Assistant – An Interactive Study Tool for Students**

---

## 📖 Introduction
Smart Campus Assistant is a web-based study support system that helps students learn more effectively using their own study materials.  
Students can upload lecture PDFs or notes and interact with the content by asking questions, generating summaries, and testing their understanding.

This system is designed to reduce the time spent reading large documents and improve exam preparation through smart interaction.

---

## 🎯 Problem Statement
Students often struggle with:
- Reading lengthy lecture PDFs
- Finding important points quickly
- Revising before exams
- Self-testing their understanding

Traditional learning methods do not provide interactive engagement with study materials.  
The Smart Campus Assistant solves this problem by allowing students to **interact directly with their notes** in a simple and efficient way.

---

## 💡 Proposed Solution
The Smart Campus Assistant provides:
- Upload-based learning from PDFs
- Automatic text extraction and cleaning
- Question answering from notes
- Summary generation
- Self-test and quiz generation

This creates an interactive and personalized learning experience for students.

---

## 🚀 Features
- 📄 Upload lecture PDFs or notes
- 🧠 Ask questions related to the uploaded content
- ✍️ Generate concise summaries
- 📝 Create self-test questions
- 🔍 Search important keywords and topics
- 🌙 Clean UI with optional dark theme
- ⚡ Fast and lightweight application

---

## 🛠️ Technologies Used

### Frontend
- Streamlit (Python-based UI framework)

### Backend
- Python

### Libraries & Tools
- `pdfplumber` – PDF text extraction
- `re` (Regular Expressions) – Text cleaning
- `streamlit` – Web application framework
- `random` – Quiz generation logic

---

## 🏗️ System Architecture
1. User uploads a PDF
2. Text is extracted from the document
3. Text is cleaned and processed
4. User interacts with the content:
   - Ask questions
   - Get summaries
   - Take quizzes
5. Results are displayed instantly

---

## 🪜 Steps to Use Smart Campus Assistant

### Step 1: Start the Application
- Open the project folder
- Run the main Python file using:
```bash
python app.py
### Step 2: Upload Study Material
   -Click on the Upload PDF / Notes option
   -Select a lecture PDF or text-based notes
   -The system accepts the file and begins processing
