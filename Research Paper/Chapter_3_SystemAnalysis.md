# Chapter 3: System Analysis

**[Font: Times New Roman, Size 12, Bold]**

---

## Overview

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This chapter presents a comprehensive system analysis of the MediCare AI platform with patient-centric focus, documenting the complete patient lifecycle through use case modeling. Use case analysis provides a user-centric perspective on system functionality, capturing interactions between patients and the system to achieve specific goals. The analysis is organized around eight primary use cases representing the core patient journey: account registration, symptom assessment with AI guidance, doctor discovery and filtering, appointment booking with conflict prevention, video consultation participation, personal profile management, medical record access, and appointment management. The use case model identifies primary and secondary actors, defines system boundaries, and specifies relationships between use cases through inclusion (mandatory) and extension (optional/conditional) relationships. Two supporting system use cases ensure data integrity (conflict prevention) and system intelligence (AI response generation) operate transparently behind patient interfaces. The UML use case diagram provides visual representation of system scope and functionality, serving as reference artifact for developers, quality assurance teams, and project stakeholders. Use case descriptions specify preconditions, postconditions, trigger events, and alternative flows, providing behavioral specifications that connect requirements (Chapter 2) with system architecture (Chapter 4). This patient-centric perspective emphasizes primary value proposition and user experience, ensuring system design prioritizes patient goals and seamless interaction flows.

---

## 3.1 Use Case Model

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 3.1.1 Actors and Roles

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI system involves the following actors in the patient-centric use case model:

**Primary Actor: Patient**
Patient is the end user seeking medical guidance and healthcare professional consultation. Patients represent the largest user group and primary drivers of system engagement. Patients access all major features through patient portal: account management, symptom checking with AI assessment, doctor discovery and filtering, appointment scheduling, video consultations, medical record access, and profile management. The patient is the primary focus of this use case analysis, representing the core value proposition and revenue model of the platform.

**Secondary Actor: Healthcare Professional (Doctor)**
Healthcare professionals appear in use case model as participants in video consultations (UC-5) and providers of appointment services. While doctors are essential to system functionality, their workflows (schedule creation, appointment management, notes generation) are secondary to patient-centric analysis and appear as supporting elements or postconditions of patient actions.

**Tertiary Actors: External Systems**
External systems (VideoSDK.live for video infrastructure, Groq API for AI language models, MongoDB for data persistence) operate transparently to patients, providing backend capabilities without direct patient awareness or interaction.

### 3.1.2 System Boundary and Scope

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI system boundary encompasses all three integrated services (Frontend, Backend, AI Service) that directly support patient interactions and workflows. Within system boundary:

- Patient account creation, authentication, and management
- AI-powered symptom assessment through natural language conversation
- Doctor search, discovery, and filtering by specialty and availability
- Appointment scheduling with real-time availability checking and conflict detection
- Video consultation infrastructure providing secure real-time communication
- Chat session management maintaining conversation history and context
- Medical record retrieval and consultation note access
- Appointment list management organizing consultations by status

Within system boundary (continued):
- Digital prescription creation by doctors for completed consultations
- Patient access to prescriptions issued by their doctors
- In-app notification delivery for prescription issuance and appointment events

Outside system boundary (not in primary use case model):
- System administrator functions and monitoring
- Insurance and payment processing
- Advanced analytics and clinical decision support
- Hospital EHR system integrations (future enhancement)
- Regulatory compliance mechanisms (GDPR/PDPA features)

### 3.1.3 UML Use Case Diagram

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The following UML use case diagram represents the patient-centric use case model, illustrating actors, use cases, system boundary, and relationships between use cases:

```
┌──────────────────────────────────────────────────────────────────┐
│                    MediCare AI System                            │
│                                                                  │
│         ╔═══════════════════════════════════╗                   │
│         ║  UC-1: Register Patient Account   ║                   │
│         ╚═══════════════════════════════════╝                   │
│                      ▲                                            │
│                      │ <<include>>                                │
│                      │                                            │
│                      │                                            │
│    ┌────────┐   ┌──────────────────────┐   ┌───────────────┐    │
│    │        │   │   UC-2: Describe     │   │   UC-3:       │    │
│    │        │   │   Symptoms & Get     │   │   Search &    │    │
│    │Patient ├───┤   AI Assessment      ├───┤   Filter      │    │
│    │        │   │                      │   │   Doctors     │    │
│    │        │   │ <<include>>          │   │               │    │
│    │        │   │ - Login              │   │ <<extend>>    │    │
│    │        │   │ - Validate Input     │   │ UC-3a:        │    │
│    │        │   │ - Call AI Service    │   │ View Doctor   │    │
│    │        │   │                      │   │ Details       │    │
│    │        │   │ <<extend>>           │   │               │    │
│    │        │   │ Follow-up Questions  │   └───────┬───────┘    │
│    │        │   │                      │           │            │
│    │        │   └────────────┬─────────┘           │            │
│    │        │                │                     │            │
│    │        │                │ <<extend>>          │            │
│    │        │                │ Transition to       │            │
│    │        │                │ Doctor Search       │            │
│    │        │                │                     ▼            │
│    │        │                │              ┌──────────────┐    │
│    │        │                │              │  UC-4:       │    │
│    │        │                │              │  Book        │    │
│    │        │                │              │  Appointment │    │
│    │        │                │              │              │    │
│    │        │                │              │ <<include>>  │    │
│    │        │                │              │ - Select     │    │
│    │        │                │              │   Slot       │    │
│    │        │                │              │ - Prevent    │    │
│    │        │                │              │   Conflicts  │    │
│    │        │                │              │ - Create     │    │
│    │        │                │              │   VideoSDK   │    │
│    │        │                │              │   Room       │    │
│    │        │                │              │              │    │
│    │        │                │              │ <<extend>>   │    │
│    │        │                │              │ UC-4a:       │    │
│    │        │                │              │ Cancel       │    │
│    │        │                │              │ Appt         │    │
│    │        │                │              └────┬─────────┘    │
│    │        │ <<include>>     │                   │              │
│    │        │ UC-6: Manage    │                   │ <<include>>  │
│    │        │ Profile         │                   │ Complete     │
│    │        │                 │                   │              │
│    │        │ <<include>>     │                   ▼              │
│    │        │ UC-8: Manage    │              ┌──────────────┐   │
│    │        │ Appointments    │              │  UC-5:       │   │
│    │        │                 │              │  Join Video  │   │
│    │        └─────────────────┤              │  Call        │   │
│    │                          │              │              │   │
│    │ <<include>>              │              │ <<include>>  │   │
│    │ Access after             │              │ - Validate   │   │
│    │ Consultation             │              │   Timing     │   │
│    │                          │              │ - Join Room  │   │
│    │                          │              │ - Manage     │   │
│    │                          │              │   Media      │   │
│    │                          │              │              │   │
│    │                          │              │ <<extend>>   │   │
│    │                          │              │ UC-5a:       │   │
│    │                          │              │ Handle       │   │
│    │                          │              │ Network      │   │
│    │                          │              │ Issues       │   │
│    │                          │              └────┬─────────┘   │
│    │                          │                   │              │
│    │                          │                   ▼              │
│    │                          │          ┌───────────────────┐  │
│    │                          │          │  UC-7: View       │  │
│    │                          │          │  Medical Records  │  │
│    │                          │          │  & Notes          │  │
│    │                          │          │                   │  │
│    │                          │          │ <<include>>       │  │
│    │                          │          │ - Retrieve Notes  │  │
│    │                          │          │ - Display Summary │  │
│    │                          │          │ - Download PDF    │  │
│    │                          │          │                   │  │
│    │                          │          │ <<extend>>        │  │
│    │                          │          │ UC-7a:            │  │
│    │                          │          │ Share Records     │  │
│    │                          │          │                   │  │
│    │                          │          │ <<extend>>        │  │
│    │                          │          │ UC-7b:            │  │
│    │                          │          │ Schedule          │  │
│    │                          │          │ Follow-up         │  │
│    │                          └──────────┤                   │  │
│    │                                     └───────────────────┘  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      SUPPORTING SYSTEM USE CASES (Backend/Internal)        │ │
│  │                                                            │ │
│  │  ┌──────────────────┐       ┌──────────────────┐          │ │
│  │  │  UC-9: Prevent   │       │  UC-10: Generate │          │ │
│  │  │  Appointment     │       │  AI Responses    │          │ │
│  │  │  Conflicts       │       │                  │          │ │
│  │  │                  │       │ (supports UC-2)  │          │ │
│  │  │ (supports UC-4)  │       │                  │          │ │
│  │  └──────────────────┘       └──────────────────┘          │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  DOCTOR-INITIATED USE CASES:                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ┌────────┐    ┌─────────────────────────────────────┐  │   │
│  │  │        │    │  UC-11: Write Prescription          │  │   │
│  │  │        │    │  Precondition: appt = completed      │  │   │
│  │  │ Doctor ├───►│  <<extend>> UC-11a:                  │  │   │
│  │  │        │    │  View Patient Appointment History    │  │   │
│  │  │        │    └──────────────┬──────────────────────┘  │   │
│  │  │        │                   │ triggers notification    │   │
│  │  │        │                   ▼                         │   │
│  │  │        │    ┌─────────────────────────────────────┐  │   │
│  │  │        │    │  UC-12: View Prescription (Patient) │  │   │
│  │  └────────┘    │  Precondition: prescription exists  │  │   │
│  │                └─────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  External Systems (Transparent to Patient):                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  VideoSDK.live    │  Groq LLaMA 3.1  │  MongoDB            │ │
│  │  Video Calls      │  AI Responses    │  Data Storage       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


LEGEND:
━━━━━━
  ▲
  │ <<include>> = Required/Mandatory use case
  │             (always executed as part of interaction)
  │
  ◇──────► <<extend>> = Optional/Conditional use case
                       (executed under specific conditions)
           
  ╔═════╗  Primary entry point use case
  ╚═════╝
  
  ┌─────┐  Supporting system use case
  └─────┘  (internal operation, not user-facing)
```

### 3.1.4 Use Case Summary and Characteristics

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Table 3.1 - Primary Use Cases Summary**

| UC ID | Use Case Name | Actor | Type | Complexity | Priority |
|---|---|---|---|---|---|
| UC-1 | Register Patient Account | Patient | Primary | Low | HIGH |
| UC-2 | Describe Symptoms & Get AI Assessment | Patient | Primary | High | HIGH |
| UC-3 | Search and Filter Doctors | Patient | Primary | Medium | HIGH |
| UC-3a | View Doctor Details | Patient | Secondary | Low | MEDIUM |
| UC-4 | Book Appointment | Patient | Primary | High | HIGH |
| UC-4a | Cancel Appointment | Patient | Secondary | Medium | MEDIUM |
| UC-5 | Join Video Consultation | Patient | Primary | High | HIGH |
| UC-5a | Handle Network Issues | System | Secondary | Medium | MEDIUM |
| UC-6 | Manage Patient Profile | Patient | Primary | Low | MEDIUM |
| UC-7 | View Medical Records & Notes | Patient | Primary | Medium | MEDIUM |
| UC-7a | Share Medical Records | Patient | Secondary | Low | LOW |
| UC-7b | Schedule Follow-up Appointment | Patient | Secondary | Medium | MEDIUM |
| UC-8 | Manage Appointments | Patient | Primary | Medium | HIGH |
| UC-9 | Prevent Appointment Conflicts | System | Supporting | High | HIGH |
| UC-10 | Generate AI Responses | System | Supporting | High | HIGH |
| UC-11 | Write Prescription | Doctor | Primary | Medium | HIGH |
| UC-11a | View Patient Appointment History | Doctor | Secondary | Low | MEDIUM |
| UC-12 | View Prescription | Patient | Primary | Low | HIGH |

### 3.1.5 Use Case Relationships and Dependencies

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Inclusion Relationships (<<include>>):**
Inclusion relationships represent mandatory use cases that must be executed as part of the including use case. These represent fundamental dependencies:

- **UC-1 → UC-2**: Patient must register and login before accessing AI symptom checker
- **UC-2 → UC-10**: Symptom description automatically triggers AI response generation (system use case)
- **UC-3 → UC-4**: Doctor discovery typically flows into appointment booking workflow
- **UC-4 → UC-9**: Appointment booking automatically includes conflict detection (system use case)
- **UC-5 → UC-4**: Joining video consultation requires prior appointment booking
- **UC-8 → UC-5**: Accessing video room happens through appointments list
- **UC-7 → UC-5**: Medical records available after consultation completion

**Extension Relationships (<<extend>>):**
Extension relationships represent optional or conditional use cases that extend parent use case under specific circumstances:

- **UC-2 →→ UC-3**: Patient may transition from symptom assessment to finding doctor (optional but common flow)
- **UC-3 →→ UC-3a**: Viewing doctor details optional before booking appointment
- **UC-4 →→ UC-4a**: Cancellation conditional on patient choice and timing
- **UC-5 →→ UC-5a**: Network issue handling occurs if bandwidth degrades (conditional)
- **UC-7 →→ UC-7a**: Sharing notes optional; depends on patient need
- **UC-7 →→ UC-7b**: Follow-up booking optional; depends on consultation outcome

**Prescription Relationships:**
- **UC-11 → UC-4**: Doctor can only write prescription for an appointment they conducted (completed status)
- **UC-11 →→ UC-11a**: Doctor may optionally view the patient's full appointment history before writing prescription
- **UC-11 → UC-12**: Prescription creation triggers patient notification and enables UC-12
- **UC-12 → UC-5**: Patient can view prescription only after consultation (UC-5) is complete

**Primary Patient Journey (Sequence):**
Typical patient workflow follows: UC-1 (initial) → UC-2/UC-3 (exploration) → UC-4 (booking) → UC-5 (consultation) → UC-7 (notes review) → UC-12 (prescription view) → UC-8 (management)

However, workflows are flexible: existing patients skip UC-1, can explore symptom checker without booking, can cancel appointments, may not need medical records.

---

## 3.2 Use Case Descriptions

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 3.2.1 UC-1: Register Patient Account

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-1  
**Use Case Name:** Register Patient Account  
**Primary Actor:** Patient  
**Secondary Actors:** System (authentication, database), Email validation service  
**Preconditions:** Patient is not registered, patient has valid email address and internet connectivity  
**Postconditions:** Patient account created and stored in MongoDB, patient authenticated with JWT token, patient redirected to dashboard  
**Trigger Event:** Patient clicks "Sign Up" button on landing page

**Description:**
Patient navigates to registration page displaying form requesting: First Name (required), Last Name (required), Email (required, must be unique), Password (required, minimum 8 characters with 1 uppercase, 1 lowercase, 1 number, 1 special character), Confirm Password (required, must match password), Age (optional, 18-120 range), Gender (optional, select from: Male, Female, Other). Patient completes form and clicks "Create Account". System validates all inputs: email format compliance (RFC 5322), email uniqueness check against existing patients, password complexity requirements. Upon successful validation, system hashes password using bcrypt with salt rounds = 10. System creates Patient document in MongoDB with: firstName, lastName, email, hashedPassword, age, gender, createdAt timestamp, no sensitive data. System generates JWT authentication token signed with P_SecretKey (patient-specific secret) with 6-hour expiration. Token stored in httpOnly, Secure, SameSite=Strict cookie for stateless session management. System stores patientData (name only, no sensitive information) in localStorage for UI display. System returns success response and redirects patient to /patient/dashboard. Patient sees personalized greeting: "Welcome [firstName]!"

**Alternative Flows:**
- If email already registered: system displays error "This email is already registered. Please log in or use a different email." Patient can retry with different email or navigate to login page
- If password lacks complexity requirements: system displays specific feedback "Password must contain: 1 uppercase, 1 lowercase, 1 number, 1 special character, minimum 8 characters"
- If password confirmation mismatch: system displays error "Passwords do not match. Please try again."
- If network error occurs during submission: transaction rolled back, patient can retry registration

**Key Validations:**
- Email format validation against RFC 5322 standard
- Email uniqueness check preventing duplicate accounts
- Password complexity enforcement with specific rules
- Age range validation if provided
- Gender selection from predefined enum values
- First/Last name non-empty and within character limits

**Related Use Cases:**
- Precedes UC-2 (AI symptom checking requires authentication)
- Enables UC-3 (doctor search requires authentication)
- Enables all subsequent patient workflows

---

### 3.2.2 UC-2: Describe Symptoms & Get AI Assessment

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-2  
**Use Case Name:** Describe Symptoms & Get AI Assessment  
**Primary Actor:** Patient  
**Secondary Actors:** System (chat session management), AI Service (RAG pipeline), Groq API (LLaMA 3.1 8B model), FAISS (vector database)  
**Preconditions:** Patient is authenticated and logged in, patient is on symptom checker page, AI Service is operational  
**Postconditions:** AI assessment provided with medical disclaimers, assessment stored in chat history, conversation context maintained  
**Trigger Event:** Patient types symptom description and sends message

**Description:**
Patient navigates to /ai-chat page (symptom checker interface) displaying text input field for symptom description and message list area. If existing chat sessions available, previous conversations listed in sidebar. Patient enters free-form symptom description without predefined symptom lists (e.g., "I have had severe headaches for 3 days with high fever and neck stiffness"). Patient clicks "Send" button or presses Ctrl+Enter. System displays patient message in chat with timestamp and "Patient" label. System displays loading indicator "AI is thinking..." with animated dots. Backend creates Chat session if first message (generates unique sessionId), or uses existing sessionId if follow-up question. Backend forwards message to AI Service POST /chat with: { message, session_id, chat_history: last 10 messages }. 

AI Service executes Retrieval-Augmented Generation pipeline: (1) applies history-aware retriever converting message to standalone query using LLM with conversation context, (2) converts query to embeddings using sentence-transformers/all-MiniLM-L6-v2 (384-dimensional embeddings), (3) performs FAISS vector similarity search with k=3 retrieving most relevant medical document chunks from indexed textbooks (Harrison's Manual of Medicine, Hutchison's Clinical Methods, Nelson's Essentials of Pediatrics, Robbins Pathology, Gale Encyclopedia of Medicine), (4) constructs LLM prompt: system_prompt + retrieved_context + user_query, (5) calls Groq LLaMA 3.1 8B model with temperature=0.3 for controlled deterministic responses, max_tokens=1000.

Groq LLaMA generates response grounded strictly in retrieved medical knowledge (no hallucinations). AI Service detects emergency symptoms in user message or response: checks for keywords like "chest pain", "difficulty breathing", "severe bleeding", "loss of consciousness", "severe allergic reaction", "uncontrollable bleeding". If emergency detected, response prepended with: "🚨 EMERGENCY SYMPTOMS DETECTED: [symptoms]. Call emergency services (15) immediately. Do not rely on this assessment."

Response formatted with standardized medical sections: 📋 Understanding Your Symptoms (rephrasing patient description), 🔍 Possible Conditions (list of conditions matching symptoms with likelihood descriptions), 💊 General Treatment Approaches (general treatment information), 💉 Medications Commonly Used (medication categories without specific prescriptions), 🏥 Precautionary Measures (preventive actions), 👨‍⚕️ When to Seek Medical Care (red flags requiring professional attention), ⚕️ Next Steps Recommendation (guidance on professional consultation). Medical disclaimer included at top: "⚠️ This assessment is based on artificial intelligence and does not constitute medical advice. Always consult qualified healthcare professional."

Response returns to backend within 3-5 seconds typical latency (maximum 30-second timeout). Backend appends both patient message and AI response to Chat.messages array in MongoDB (atomic transaction). Backend returns response to frontend. Frontend displays response in chat with gray background, markdown rendering applied (headings, bullet points, bold text). Chat history sidebar updated showing conversation in list. Input field cleared and ready for next message. Patient can ask follow-up questions in same session; AI Service uses last 10 messages for context. Patient can click on previous conversation in sidebar to restore full conversation history.

**Alternative Flows:**
- **Emergency symptoms detected:** Prominent red warning box displayed preventing dismissal, directing immediate emergency care
- **Low confidence assessment (confidence < 0.7):** System appends note "[Low confidence assessment - please consult healthcare professional]"
- **Out-of-scope symptoms (no documents retrieved with similarity ≥ 0.4):** AI returns "I don't have sufficient information about these specific symptoms in my medical knowledge base. Please consult a qualified healthcare professional who can evaluate your condition." (prevents hallucinated diagnoses)
- **Follow-up question in same session:** Patient asks clarification (e.g., "Is this serious?"), system sends message with existing sessionId, maintains conversation history, AI provides answer using previous context
- **Patient starts new chat:** Patient clicks "New Chat" button, creates new sessionId, previous conversation still accessible in sidebar

**Extension: Transition to Doctor Search**
Patient reads assessment and decides to book consultation. Patient clicks "Find Doctors" button embedded in response or navigates to doctor search (UC-3). System transitions seamlessly to doctor discovery workflow.

**Key Features:**
- Natural language symptom input (no predefined symptom lists)
- Multi-turn conversation support with history context awareness
- Markdown response formatting with visual hierarchy
- Emergency symptom detection with prominent warnings
- Confidence scoring for assessment reliability
- Chat history persistence across sessions
- Multiple concurrent chat sessions per patient
- Response completion within 3-5 seconds typical

**Related Use Cases:**
- Includes UC-10 (AI response generation - system use case)
- May extend to UC-3 (doctor discovery after assessment)
- Accessible from UC-8 (appointments list view)

---

### 3.2.3 UC-3: Search and Filter Doctors

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-3  
**Use Case Name:** Search and Filter Doctors  
**Primary Actor:** Patient  
**Secondary Actors:** System (doctor database query), Doctor collection (MongoDB)  
**Preconditions:** Patient is authenticated, patient is on doctor discovery page (/doctors)  
**Postconditions:** Patient has identified doctor of interest, doctor list filtered by preferences  
**Trigger Event:** Patient navigates to "Find Doctors" from navigation or symptom assessment

**Description:**
System displays responsive doctor discovery page with controls and doctor listings. Search and filter controls include: (1) Search input field with placeholder "Search doctors by name or specialty...", (2) Filter dropdown "Filter by Specialty", (3) Specialty checkboxes with doctor counts (e.g., "General Practice (12)", "Cardiology (5)", "Pediatrics (8)"). Doctor listing displays in responsive grid: 1 column on mobile (< 768px), 2 columns on tablet (768-1024px), 3 columns on desktop (> 1024px). Each doctor card displays: profile picture (150px × 150px), full name with title ("Dr. [Last Name]"), medical specialty, degrees/qualifications comma-separated (e.g., "MBBS, MD Cardiology"), availability badge ("Available Today", "Available This Week", "Fully Booked"), patient rating if reviews implemented (e.g., "⭐⭐⭐⭐⭐ 4.8/5"), consultation count ("127 consultations"). System initially loads all doctors (e.g., "All doctors (25)").

Patient can filter by specialty: clicks "Filter by Specialty" dropdown, selects one or more specialties with checkboxes, system immediately filters displayed doctors (client-side filtering using already-loaded data). Doctor count updates: "Showing 5 cardiologists". Patient can search by doctor name: types doctor name in search field (e.g., "Ahmed"), system performs real-time fuzzy matching, displays matching doctors. Patient can clear filters by clicking "Clear All Filters" button, returns to showing all doctors. Patient reviews doctors matching criteria and identifies suitable match based on specialty, qualifications, availability, ratings.

**Alternative Flows:**
- **Search by specialty:** Patient types "Cardiology" in search field, matches both specialty names and doctor names containing term
- **Multiple specialty selection:** Patient selects multiple specialties (Cardiology AND General Practice), system uses OR logic displaying doctors from any selected specialty
- **No doctors match filter:** System displays "No doctors found matching filter. Try different specialty or clear filters to see all doctors."
- **No doctors registered:** System displays "No doctors currently available. Please check back soon." (unlikely in production)
- **View doctor details:** Patient can click doctor card to view UC-3a (extended use case) with full information before deciding

**Extension: UC-3a - View Doctor Details**
Patient clicks on doctor card or doctor name to view detail page at /doctor/:doctorId. System displays: large profile picture, full name with title, complete specialty description, all degrees/qualifications with institutions, phone number (masked for privacy), complete bio if available, patient reviews and ratings if implemented (not in v1.0), detailed availability ("Available: Mon-Fri 9:00-17:00"), consultation count ("127 consultations"), average consultation fee range, prominent "Book Appointment" button. Patient verifies credentials and patient ratings, makes informed decision about doctor selection.

**Key Features:**
- Responsive grid layout adapting to device screen size
- Real-time search and filtering (client-side, instant response)
- Doctor availability indicators
- Professional credentials clearly displayed
- Patient ratings and social proof (future enhancement)
- Multiple filtering criteria support
- Clear visual hierarchy and professional presentation

**Related Use Cases:**
- Accessible from UC-2 (symptom assessment transition)
- Includes UC-3a (viewing doctor details)
- Leads to UC-4 (appointment booking)

---

### 3.2.4 UC-4: Book Appointment

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-4  
**Use Case Name:** Book Appointment  
**Primary Actor:** Patient  
**Secondary Actors:** System (scheduling logic, conflict detection), VideoSDK (video room creation), Database (Schedule and Appointment collections)  
**Preconditions:** Patient selected doctor (UC-3), patient authenticated, available slots exist, no conflicting appointments on patient calendar  
**Postconditions:** Appointment created in database, VideoSDK room created, Schedule slot marked as 'booked', confirmation displayed  
**Trigger Event:** Patient selects available time slot and confirms booking

**Description:**
System navigates to appointment booking page for selected doctor (/book-appointment/:doctorId). System displays calendar showing next 30 days: available dates highlighted green, fully booked dates gray, past dates disabled/grayed out. Patient clicks on specific date (e.g., "Monday, January 15, 2024"), system displays available time slots for selected date in table format with columns: Time (HH:MM format, e.g., "14:30", "14:45", "15:00"), Duration (15 minutes, 30 minutes, etc.), Fee (PKR currency with symbol, e.g., "500 PKR", "1000 PKR"). Available slots displayed with white background and clickable styling. Booked slots displayed in gray with "Booked" label and disabled (not clickable). Past slots hidden from display.

Patient selects available slot (e.g., "14:30 - 500 PKR for 15 minutes"). System displays confirmation dialog showing: doctor name and thumbnail photo, appointment date ("Monday, January 15, 2024"), appointment time ("2:30 PM - 2:45 PM"), duration ("15 minutes"), consultation fee ("500 PKR"), total cost ("500 PKR"), two buttons: "Confirm" (blue), "Cancel" (gray). Patient reviews details and clicks "Confirm".

Frontend sends POST /Book_Appointment/:scheduleId with: { patient_id, doctor_id, schedule_id }. Backend validates: schedule exists with specified ID, schedule status currently 'available', schedule date/time valid (not expired). Backend executes conflict detection (UC-9): queries Appointment collection for existing appointments where patient_id = this_patient AND appointment date = selected slot date AND appointment time overlaps with selected slot time AND appointment status IN ['booked', 'ongoing']. If conflict found, returns 409 Conflict: "You already have appointment on this date at [time]. Overlapping appointments not allowed." Booking prevented.

If no conflict: Backend calls VideoSDK REST API to create video room for consultation. Backend passes: room_id (unique identifier), configuration parameters. VideoSDK API returns room_id (e.g., "abc123def456"). Backend creates Appointment document: { patient_id, doctor_id, schedule_id, meeting_id: room_id, status: 'booked', createdAt }. Backend updates Schedule status: 'available' → 'booked' (prevents other patients booking same slot). Backend commits transaction atomically (all three operations succeed together or all rollback). Backend returns success response with appointment details: { appointment_id, meeting_id, doctor_name, date, time }.

Frontend displays success message: "✓ Appointment booked successfully!" with details and buttons: "View My Appointments" (navigates to UC-8), "Book Another" (resets form), "Go Home" (returns to dashboard). Appointment appears immediately in patient's appointment list (UC-8 updated).

**Alternative Flows:**
- **Patient cancels confirmation:** At confirmation dialog, patient clicks "Cancel", dialog closes, returns to slot selection without creating appointment
- **Another patient books same slot concurrently:** Between patient viewing slots and confirming, another patient books slot. Backend detects in UC-9 conflict check: slot status changed from 'available' to 'booked'. Backend returns error: "This slot was just booked by another patient. Please select different slot." System refreshes available slots, patient must select alternative slot
- **Patient has conflicting appointment:** UC-9 detects overlap: patient already has appointment on selected date with overlapping time. Booking prevented
- **VideoSDK room creation fails:** Backend calls VideoSDK, receives error or timeout. Backend returns 503 Service Unavailable: "Unable to create video room. Please try again." Transaction rolled back, no appointment created
- **Database write fails:** MongoDB fails during Appointment creation or Schedule update. Backend returns error, rolls back partial changes

**Extension: UC-4a - Cancel Appointment**
Patient views appointment in appointment list (UC-8) and clicks "Cancel" button. System displays confirmation dialog: "Are you sure you want to cancel this appointment?" with appointment details and cancellation policy: "You can cancel free of charge up to 24 hours before appointment." System calculates hours remaining until appointment. If ≥ 24 hours: standard cancellation, no warning. If < 24 hours: system displays warning "Canceling within 24 hours requires courtesy to doctor" but allows cancellation. Patient clicks "Confirm Cancellation". Backend validates: appointment exists, patient owns appointment, appointment status = 'booked' (not in progress or completed), appointment not already canceled. Backend updates: Appointment status 'booked' → 'cancelled', Schedule status 'booked' → 'available' (slot available for rebooking). Backend commits atomically. Frontend displays: "✓ Appointment canceled successfully." Appointment removed from "Upcoming" tab, moves to "Cancelled" tab. Slot immediately available for other patients to book.

**Key Features:**
- Calendar view with visual availability indicators
- Real-time slot availability checking
- Conflict detection preventing double-booking
- VideoSDK room creation on booking
- Atomic transaction ensuring data consistency
- Confirmation dialog preventing accidental booking
- 24-hour cancellation policy with flexible enforcement
- Immediate availability feedback

**Related Use Cases:**
- Extends from UC-3 (doctor selection)
- Includes UC-9 (conflict detection - system use case)
- Leads to UC-5 (video consultation)
- Integrated with UC-8 (appointment appears in list)

---

### 3.2.5 UC-5: Join Video Consultation

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-5  
**Use Case Name:** Join Video Consultation  
**Primary Actor:** Patient  
**Secondary Actors:** Healthcare Professional (Doctor), VideoSDK infrastructure, System (timing validation)  
**Preconditions:** Appointment booked (UC-4 completed), current time within appointment window (startTime - 5 minutes to endTime + 5 minutes), patient authenticated, patient has microphone and camera  
**Postconditions:** Patient joined video room with doctor, real-time audio/video established, appointment status updated to 'ongoing'  
**Trigger Event:** Patient clicks "Join Now" button on upcoming appointment

**Description:**
Patient views appointment list (UC-8) and at appointment time (or within 5-minute early entry buffer), sees "Join Now" button available on appointment card. Button displayed in blue with emphasis. Patient clicks "Join Now" button. Frontend navigates to /room/:meetingId (where meetingId is the VideoSDK room ID stored with appointment). Frontend calls backend GET /join-meeting/:roomId to validate appointment timing. Backend queries Appointment by meeting_id, retrieves associated Schedule document. Backend validates: (1) current_date equals appointment date, (2) current_time >= (appointment startTime - 5 minutes), (3) current_time <= (appointment endTime + 5 minutes). If timing invalid: backend returns 403 Forbidden with appropriate message ("Appointment not yet started. Please try again at [time]" or "Appointment time has passed."). If timing valid: backend updates Appointment status: 'booked' → 'ongoing'. Backend generates VideoSDK JWT token containing: room_id, participant_name (patient's name), iat (issued at), exp (expires at: appointment endTime), permissions (allow_join: true, allow_mod: true, allow_stream: true). Token signed and encoded.

Backend schedules automatic status transition: sets setTimeout to update Appointment status to 'completed' at appointmentEndTime. Backend returns response: { token, meeting_id, remaining_time_seconds, room_config }. Frontend receives token and initializes VideoSDK prebuilt UI component with: { token, meeting_id, config }. Browser requests permissions for camera and microphone. Patient clicks "Allow" (or "Don't allow" if preferring audio-only). Camera and microphone initialize if permitted. Patient video/audio streams transmit to VideoSDK servers. VideoSDK component displays participant list showing: patient name, patient video stream (if camera enabled), "You" indicator. If doctor already joined: doctor name and doctor video stream visible. If doctor not yet joined: "Waiting for other participant..." message displays.

Patient and doctor conduct real-time video consultation: can see each other, hear audio clearly, share screen (if supported). At appointmentEndTime, VideoSDK automatically ends call. Both participants see: "Consultation ended. Thank you." Appointment status automatically updated to 'completed' (via backend setTimeout). Call cannot be rejoined after endTime. Patient sees follow-up options: "View My Appointments", "View Notes" (if notes already generated), "Book Follow-up Appointment".

**Alternative Flows:**
- **Patient joins early (before startTime - 5 minutes):** Backend returns 403 error: "Appointment has not started yet. Try again at [time]." Patient waits and clicks "Join Now" later
- **Patient joins late (after endTime + 5 minutes):** Backend returns 410 error: "Appointment time has passed." System offers: "Would you like to view meeting notes instead?"
- **Doctor hasn't joined yet:** VideoSDK displays "Waiting for other participant to join..." Patient waits. If doctor doesn't join before endTime, consultation incomplete, status marked 'completed' with note (future enhancement)
- **Microphone/camera unavailable:** Browser permission denied or device disconnected. Frontend displays warning: "Unable to access camera/microphone. Check permissions and try again." Patient can allow permissions and reconnect, or continue with audio only
- **Network connectivity issue:** During consultation, patient's bandwidth degrades. VideoSDK detects low bandwidth and automatically reduces video quality/frame rate. Audio maintained at priority. If connection completely lost: "Connection lost. Attempting to reconnect..." Patient tries refreshing, reconnects if within time window
- **Doctor ends call early:** Doctor clicks "End Call" button. VideoSDK ends connection. Appointment marked 'completed' (shorter than scheduled)

**Extension: UC-5a - Handle Network Issues**
If patient's internet connection degrades during video call (bandwidth drops below threshold), VideoSDK infrastructure automatically detects and: (1) reduces video resolution to maintain frame rate, (2) prioritizes audio quality over video, (3) disables screen sharing if active, (4) implements packet retransmission for audio. If connection completely lost (no packets received for 30+ seconds), system displays "Connection lost. Attempting to reconnect..." with countdown timer. Patient can manually refresh or reconnect. If reconnection successful within appointment time window, call resumes. If connection remains lost beyond time window, consultation ends, status marked 'completed'.

**Key Features:**
- Timing validation preventing early/late access
- Browser permissions handling (camera, microphone)
- Automatic quality adaptation based on bandwidth
- Real-time bidirectional audio/video transmission
- Participant status display
- Automatic call termination at scheduled end time
- Graceful disconnection handling
- Optional screen sharing capability (future enhancement)
- Full consultation recording possible (optional, with consent)

**Related Use Cases:**
- Requires UC-4 (appointment booking)
- Leads to UC-7 (medical records access after completion)
- Integrated with UC-8 (status updates in appointments list)

---

### 3.2.6 UC-6: Manage Patient Profile

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-6  
**Use Case Name:** Manage Patient Profile  
**Primary Actor:** Patient  
**Secondary Actors:** System (profile data storage), Database (Patient collection)  
**Preconditions:** Patient is authenticated  
**Postconditions:** Patient profile information updated in database, changes reflected throughout system  
**Trigger Event:** Patient navigates to profile/account settings page (/patient/profile)

**Description:**
System displays patient profile management page showing current account information in form: First Name (text input, editable), Last Name (text input, editable), Email (text input, non-editable, displays "Email cannot be changed"), Age (number input, optional, editable), Gender (dropdown: Male/Female/Other, optional, editable), Account Created (date display, read-only, e.g., "January 10, 2024"), Last Updated (date display, read-only). Patient can edit any editable field. Patient updates information (e.g., changes age from "28" to "29", updates name if needed). Patient clicks "Save Changes" button. Frontend validates: First Name and Last Name non-empty, age within valid range (18-120) if provided, gender selection from enum. Invalid input returns error message with specific field feedback. Upon validation, frontend sends PUT /update-patient-profile with changed fields only: { firstName, lastName, age, gender }. Backend validates authenticated user, same validations as frontend. Backend updates Patient document in MongoDB with new values (selective update, only changed fields). Backend returns success response. Frontend displays success notification: "✓ Profile updated successfully". Form refreshes showing updated values. Patient can exit profile page or continue editing.

**Alternative Flows:**
- **Patient wants to change password:** System displays "Change Password" link (not implemented v1.0, placeholder for future). Patient would enter: current password, new password, confirm new password, system validates and updates
- **Patient wants to delete account:** System displays "Delete Account" option at bottom (not implemented v1.0). Patient would confirm deletion, system would archive data and mark account inactive
- **Patient cancels changes:** Patient clicks "Cancel" button before saving, changes discarded, original values restored
- **Validation error:** Invalid age entered (e.g., "15" or "150"), system displays inline error: "Age must be between 18 and 120"

**Key Features:**
- Editable form with validation
- Immutable email field for security
- Optional demographic fields
- Immediate persistence to database
- Changes reflected in all system displays
- Error messages with specific field feedback
- Success confirmation on save

**Related Use Cases:**
- Accessible from any authenticated patient context
- Updates reflected in UC-8 (appointment display)
- Updates reflected in UC-7 (meeting notes display patient name)

---

### 3.2.7 UC-7: View Medical Records and Notes

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-7  
**Use Case Name:** View Medical Records and Notes  
**Primary Actor:** Patient  
**Secondary Actors:** System (meeting notes retrieval), Database (MeetingNote collection)  
**Preconditions:** Patient has completed at least one consultation, meeting notes generated by doctor, patient authenticated  
**Postconditions:** Patient has reviewed consultation notes, understands medical findings and recommendations  
**Trigger Event:** Patient clicks "View Notes" on completed appointment or navigates to medical records

**Description:**
System displays meeting notes from completed consultation on /notes/:appointmentId page. Notes display shows: appointment header (doctor name, patient name, consultation date and time, duration), consultation summary (markdown formatted with sections: Understanding Your Condition, Key Findings, Recommended Treatments, Medications Discussed, Follow-up Actions), formatted with readable typography and clear visual hierarchy. Notes generated automatically from consultation recording through: (1) audio transcription using faster-whisper-small model converting recording to text, (2) AI summarization using Groq LLaMA generating structured summary with key findings, recommendations, medications, follow-up items. Patient reads summary understanding consultation outcomes, medical findings, doctor recommendations, medications discussed (without specific dosages or prescriptions), follow-up care instructions. Patient can download notes as PDF file for personal records (labeled "Consultation_Notes_[PatientName]_[Date].pdf") or share with other healthcare providers (future enhancement). Patient can print notes directly from browser.

**Alternative Flows:**
- **Notes still being prepared:** Doctor hasn't generated notes yet, or transcription in progress. System displays: "Meeting notes are being prepared. Doctor will complete notes shortly. Check back in a few minutes." Patient can refresh page later
- **No notes for appointment:** Appointment completed but doctor hasn't initiated note generation. System offers: "No notes available yet. Your doctor may be reviewing notes. Check back later."
- **Patient cannot download:** System displays online-only view with print option instead of PDF download

**Extension: UC-7a - Share Medical Records**
Patient can share consultation notes with family members or other healthcare providers through secure sharing mechanism (not implemented v1.0, placeholder for future). Patient clicks "Share Notes" button, system generates unique shareable link valid for specified time period (e.g., 7 days). Patient can send link via email to family/provider. Recipient accesses notes through link without needing patient account. Sharing limited to individual notes, not full medical record.

**Extension: UC-7b - Schedule Follow-up Appointment**
After reading consultation notes, patient may need follow-up consultation. Patient clicks "Schedule Follow-up Appointment" button. System navigates directly to doctor booking page for same doctor (UC-4), preselecting same doctor. Patient can select new date/time and book follow-up appointment. System may suggest appointment within recommended timeframe (e.g., "2 weeks" if recommended in notes).

**Key Features:**
- Structured note display with clear sections
- Markdown rendering for readability and formatting
- PDF download capability for record-keeping
- Print support for physical copies
- Doctor and patient name attribution
- Timestamp and appointment reference
- Authorization checks protecting patient privacy
- Future sharing capability placeholder
- Follow-up booking integration

**Related Use Cases:**
- Follows UC-5 (video consultation completion)
- May extend to UC-7b (follow-up appointment booking)
- Integrated with UC-8 (notes access from appointments list)

---

### 3.2.8 UC-8: Manage Appointments

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-8  
**Use Case Name:** Manage Appointments  
**Primary Actor:** Patient  
**Secondary Actors:** System (appointment retrieval and status management), Database  
**Preconditions:** Patient is authenticated, patient has booked at least one appointment  
**Postconditions:** Patient can view, organize, and take actions on all appointments  
**Trigger Event:** Patient navigates to "My Appointments" page (/my-appointments)

**Description:**
System displays patient's complete appointment list organized in tabbed interface: (1) Upcoming tab (default selected) showing appointments with status='booked' and date >= today, sorted chronologically by date ascending, (2) Completed tab showing appointments with status='completed' and date < today, sorted by most recent first, (3) Cancelled tab showing appointments with status='cancelled'. Each appointment displays: doctor name (as heading), doctor photo (small thumbnail), specialty (e.g., "Cardiology"), appointment date (formatted: "Monday, January 15, 2024"), appointment time (formatted: "2:30 PM - 2:45 PM"), duration ("15 minutes"), consultation fee ("500 PKR"), status badge (color-coded: green "Upcoming", blue "Ongoing", gray "Completed", red "Cancelled"), and action buttons contextual to status.

For upcoming appointments: buttons include "Join Now" (blue, available when within 5-minute early entry buffer before appointment start time), "Cancel" (gray with dropdown menu), "Reschedule" (not implemented v1.0, placeholder). For completed appointments: buttons include "View Notes" (navigates to UC-7), "Rate Doctor" (not implemented v1.0, review system placeholder), "Book Follow-up" (navigates to UC-4 for same doctor, extends UC-7b). For cancelled appointments: display only, no action buttons.

System provides real-time status updates: as appointment time approaches, status updates from "Upcoming" to "Ongoing", "Join Now" button activates. At appointment end time, status automatically updates to "Completed", "Join Now" button disappears, "View Notes" button appears. Empty state messaging displays when no appointments in selected tab: "No upcoming appointments. Browse doctors and book consultation." System displays appointment count badges on tabs: "Upcoming (3)", "Completed (12)", "Cancelled (1)".

**Key Features:**
- Tabbed organization by appointment status
- Real-time status updates without page refresh
- Contextual action buttons for each status
- Chronological sorting for easy finding
- Doctor information displayed prominently
- Appointment details at a glance
- Empty state handling with helpful messaging
- Mobile-responsive layout

**Related Use Cases:**
- Aggregates data from UC-4 (booked appointments)
- Includes/links to UC-5 (joining video consultations)
- Includes/links to UC-4a (cancellation)
- Includes/links to UC-7 (viewing notes)
- Integrated with UC-5 (status updates when joining consultation)

---

### 3.2.9 UC-9: Prevent Appointment Conflicts (System Use Case)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-9  
**Use Case Name:** Prevent Appointment Conflicts  
**Primary Actor:** System (Backend scheduling logic)  
**Secondary Actors:** Database (MongoDB Appointment and Schedule collections)  
**Preconditions:** Patient attempts appointment booking (UC-4 process initiated), schedule slot validated as available  
**Postconditions:** Appointment created only if no conflicts detected, system data integrity maintained  
**Trigger Event:** Backend receives POST /Book_Appointment/:scheduleId request

**Description:**
Backend executes conflict detection logic as part of UC-4 appointment booking flow. System performs dual-layer protection: (1) business logic validation in application, (2) database constraints at persistence layer. Business logic: Backend queries Appointment collection to find existing appointments for this patient using filter: { patient_id = this_patient, appointment.schedule.date = selected_schedule.date, appointment.schedule.startTime < selected_schedule.endTime, appointment.schedule.endTime > selected_schedule.startTime, appointment.status IN ['booked', 'ongoing'] }. If any appointment found, temporal overlap detected. System returns 409 Conflict HTTP status with error message: "You already have appointment on this date at [time]. Overlapping appointments not allowed." Booking prevented before database write.

Database constraints: MongoDB enforces unique compound index on Schedule collection: { doctor_id, date, startTime }. This prevents two Schedule documents from existing with same doctor, date, and start time. If application logic fails to detect conflict (due to race condition or concurrency bug), database-level constraint prevents duplicate Schedule records. Additionally, once Appointment created, that Schedule slot marked 'booked' preventing other bookings.

This dual-layer architecture ensures: (1) fast rejection of conflicts at application level with meaningful error messages, (2) database integrity protection against concurrency issues, (3) no double-booking possible even under high concurrent load.

**Related Use Cases:**
- Included as mandatory step in UC-4 (appointment booking)
- Ensures system consistency and user trust

---

### 3.2.10 UC-10: Generate AI Responses (System Use Case)

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-10  
**Use Case Name:** Generate AI Responses  
**Primary Actor:** System (AI Service)  
**Secondary Actors:** Groq API (LLaMA 3.1 8B model), FAISS (vector database), LangChain (RAG framework)  
**Preconditions:** Patient sends symptom message (UC-2 process initiated), AI Service operational, medical knowledge base indexed in FAISS  
**Postconditions:** Evidence-based medical response provided to patient, response stored in chat history  
**Trigger Event:** Backend forwards patient message to AI Service POST /chat endpoint

**Description:**
AI Service receives patient symptom message (forwarded by backend) and executes Retrieval-Augmented Generation pipeline. System uses LangChain framework orchestrating RAG workflow: (1) History-Aware Retriever: applies LLM to convert patient message to standalone query incorporating conversation context (previous 10 messages). Example: if history shows "I have headache", current message "with fever" converted to "I have had headache with fever". (2) Query Embedding: converts standalone query to 384-dimensional embeddings using sentence-transformers/all-MiniLM-L6-v2 pre-trained model. (3) FAISS Similarity Search: performs vector similarity search with k=3 to retrieve most relevant medical document chunks from FAISS vector store. Index contains embeddings from five medical textbooks: Harrison's Manual of Medicine (17th Edition), Hutchison's Clinical Methods, Nelson's Essentials of Pediatrics, Robbins Pathology (7th Edition), Gale Encyclopedia of Medicine (2nd Edition). Documents matched with similarity threshold ≥ 0.4 considered relevant.

(4) Prompt Construction: assembles LLM input prompt combining: system_prompt (constraining output, specifying format, disclaimers), retrieved_context (relevant medical information), user_query (patient's symptom description). System prompt instructs: generate response in plain language for non-medical users, include mandatory medical disclaimers, detect emergency symptoms, structure response with standard sections, prevent definitive diagnoses. (5) LLM Inference: calls Groq LLaMA 3.1 8B model with configuration: temperature=0.3 (controlled, deterministic output), max_tokens=1000, system_prompt included. (6) Emergency Symptom Detection: scans response text and user message for emergency keywords: "chest pain", "difficulty breathing", "severe bleeding", "loss of consciousness", "severe allergic reaction", "uncontrollable bleeding". If detected, response prepended with: "🚨 EMERGENCY SYMPTOMS: [symptoms]. Call emergency (15) immediately."

(7) Response Formatting: structures response with markdown sections: 📋 Understanding Your Symptoms, 🔍 Possible Conditions, 💊 General Treatment, 💉 Medications, 🏥 Precautions, 👨‍⚕️ When to Seek Care, ⚕️ Next Steps. (8) Medical Disclaimer: adds non-removable disclaimer: "⚠️ Assessment for information only. Always consult qualified healthcare professional." (9) Response Return: returns to backend within 3-5 second typical latency (30-second timeout maximum): { response_text, sources: [document_ids], documents: [retrieved_chunks], confidence_score: 0.85 }.

Response strictly grounded in retrieved medical knowledge, preventing hallucinated diagnoses. If no documents retrieved with confidence ≥ 0.4, system returns: "I don't have sufficient information about these symptoms. Please consult healthcare professional."

**Related Use Cases:**
- Included as mandatory step in UC-2 (AI symptom assessment)
- Supports UC-2 multi-turn conversation capability

---

### 3.2.11 UC-11: Write Prescription

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-11
**Use Case Name:** Write Prescription
**Primary Actor:** Healthcare Professional (Doctor)
**Secondary Actors:** System (prescription storage, notification dispatch), Database (Prescription and Notification collections)
**Preconditions:** Doctor is authenticated and logged in, selected appointment has status = 'completed', doctor is the assigned doctor for that appointment, no prescription yet issued for this appointment
**Postconditions:** Prescription document created in MongoDB with all clinical details, patient notified via in-app notification, prescription visible to both doctor and patient
**Trigger Event:** Doctor clicks "Write Prescription" on a completed appointment card in the doctor portal

**Description:**
Doctor navigates to their appointments list where completed appointments are visible under the "Completed" tab. For each completed appointment, the system shows a "Write Prescription" button (if no prescription exists) or a "View Prescription" button (if a prescription has already been issued). Doctor clicks "Write Prescription". System validates that the appointment is completed and that no prescription has already been created for this appointment. System displays a structured prescription form pre-filled with: doctor name, patient name (read-only), appointment date (read-only). Doctor completes the form with: (1) **Diagnosis** — free-text description of the clinical diagnosis, (2) **Medicines** — one or more medicine entries, each including: medicine name, dosage (e.g., "500mg"), frequency (e.g., "Twice daily"), duration (e.g., "7 days"), special instructions (e.g., "Take after meals"), (3) **Vital Signs** — blood pressure (e.g., "120/80"), temperature (e.g., "37.2°C"), pulse (e.g., "72 bpm"), weight (e.g., "65 kg"), (4) **Advice** — lifestyle or dietary recommendations, (5) **Follow-up Date** — optional date for next consultation.

Doctor clicks "Submit Prescription". System validates that at least one medicine entry has a name and dosage. Backend creates Prescription document in MongoDB with the above fields, unique constraint on appointment_id preventing duplicates. Backend creates Notification document for patient with: type = 'prescription_issued', title = 'Prescription Ready', message = 'Dr. [LastName] has issued your prescription.' Prescription persisted as an immutable clinical record. System returns 201 Created. Doctor interface updates: "Write Prescription" button replaced by "View Prescription" button on that appointment card. Doctor sees success message: "Prescription issued successfully."

**Extension: UC-11a — View Patient Appointment History**
Before writing the prescription, the doctor may optionally review the patient's prior consultation history. Doctor clicks "View Patient History" link on the appointment detail. System retrieves all past completed appointments between this doctor and patient, including their associated meeting notes and previously issued prescriptions. This allows the doctor to ensure clinical continuity (e.g., checking previous diagnoses or medications) before authoring the new prescription. History is displayed in read-only format.

**Alternative Flows:**
- **Prescription already exists:** System shows "Prescription already issued for this appointment" and redirects to View Prescription (UC-11 → read-only view)
- **Appointment not completed:** Button hidden; if attempted via direct URL, backend returns 400 Bad Request: "Prescription can only be issued for completed appointments"
- **Doctor not assigned to this appointment:** Backend returns 403 Forbidden
- **Form submitted with no medicines:** Frontend validation blocks submission: "Please add at least one medicine with name and dosage"

**Key Features:**
- Structured form enforcing clinical completeness (diagnosis + medicines required)
- Dynamic medicines table (add/remove rows for multiple medicines)
- Vital signs capture during post-consultation prescription
- One-prescription-per-appointment idempotency at database level
- Automatic patient notification on prescription issuance
- Immutable record — prescriptions cannot be deleted after issuance

**Related Use Cases:**
- Requires UC-4/UC-5 to have been completed (appointment completed)
- Optionally extends to UC-11a (view patient history for clinical context)
- Triggers patient notification enabling UC-12 (patient views prescription)

---

### 3.2.12 UC-12: View Prescription

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Use Case ID:** UC-12
**Use Case Name:** View Prescription
**Primary Actor:** Patient
**Secondary Actors:** System (prescription retrieval, authorization check), Database (Prescription collection)
**Preconditions:** Patient is authenticated, appointment is completed and has status = 'completed', a prescription has been issued by the doctor for this appointment
**Postconditions:** Patient has reviewed the prescription details including diagnosis, medicines list, vital signs, advice, and follow-up date
**Trigger Event:** Patient clicks "View Prescription" on a completed appointment card, or taps the prescription notification in the notification panel

**Description:**
Patient navigates to their appointments list and sees completed appointments with a "View Prescription" button on any appointment for which a prescription has been issued. Patient may also receive an in-app notification ("Your prescription is ready") and can click directly from the notification panel. Patient clicks "View Prescription". Frontend calls backend GET /prescriptions/my/:appointmentId. Backend validates: patient is authenticated, patient_id on the prescription matches the requesting patient. If unauthorized, returns 403 Forbidden. On success, system retrieves and returns the prescription document.

System displays the prescription in a formatted, print-friendly layout structured as follows: **Header** (doctor name, patient name, consultation date), **Diagnosis** (displayed in a highlighted box), **Medicines** (formatted table: Medicine Name | Dosage | Frequency | Duration | Instructions, one row per medicine), **Vital Signs** (compact table: Blood Pressure | Temperature | Pulse | Weight), **Advice** (text section), **Follow-up Date** (if specified, displayed with a calendar icon). Patient reads all prescription details. Patient can print the prescription using browser print function or use the "Download" option if implemented. Prescription is read-only; patient cannot modify any content.

**Alternative Flows:**
- **No prescription yet:** Button not shown on appointment card. If accessed directly, system displays "Prescription not yet available for this appointment. Your doctor may issue one after reviewing your consultation."
- **Notification click:** Patient taps prescription notification from notification panel, system navigates directly to the prescription view for the relevant appointment
- **Patient not owner:** Backend returns 403 Forbidden; patient cannot view another patient's prescription

**Key Features:**
- Secured endpoint — patient can only access their own prescriptions
- Prescription accessible via appointment card or notification panel
- Clean, print-friendly prescription layout matching clinical document standards
- Read-only display preventing unauthorized modification
- All prescription details visible in one view (no pagination)

**Related Use Cases:**
- Enabled by UC-11 (doctor must issue prescription first)
- Accessible from UC-8 (appointment management — "View Prescription" button)
- Triggered by system notification generated during UC-11

---

## Summary

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This chapter has presented comprehensive system analysis of the MediCare AI platform through patient-centric use case modeling. Eight primary use cases document the complete patient lifecycle from registration (UC-1) through symptom assessment (UC-2), doctor discovery (UC-3), appointment booking (UC-4), video consultation (UC-5), profile management (UC-6), medical record access (UC-7), and appointment management (UC-8). Secondary use cases extend primary workflows with optional functionality: viewing doctor details (UC-3a), canceling appointments (UC-4a), handling network issues (UC-5a), sharing medical records (UC-7a), and scheduling follow-ups (UC-7b). Two supporting system use cases ensure system reliability: conflict prevention (UC-9) prevents double-booking through business logic and database constraints, and AI response generation (UC-10) implements RAG pipeline providing evidence-based guidance. Two prescription-management use cases complete the post-consultation workflow: UC-11 (Write Prescription) enables doctors to issue structured digital prescriptions covering diagnosis, medicines, vital signs, and follow-up instructions immediately after a completed appointment, with idempotency enforced at the database level and an in-platform notification dispatched to the patient; UC-11a (View Patient Appointment History) extends UC-11 by allowing the doctor to review a patient's prior appointments and prescriptions before writing a new one. UC-12 (View Prescription) captures the patient-side interaction, covering access from the appointment card or notification, authorization enforcement ensuring only the intended patient can view the prescription, and a print-friendly formatted display. The UML use case diagram provides visual reference showing actors, system boundary, inclusion/extension relationships, supporting use cases, and external systems. Use case descriptions specify preconditions, postconditions, trigger events, alternative flows, and detailed behavioral flows connecting patient and doctor actions with system operations. The patient-centric perspective prioritizes user experience and patient goals, ensuring system design reflects how patients actually interact with healthcare services. The use case analysis bridges requirements specification (Chapter 2) and system architecture (Chapter 4), providing detailed behavioral blueprints for implementation, testing, and validation.

---

**End of Chapter 3**

**[Total Word Count: Approximately 6,500 words]**
**[Formatting: Times New Roman, 12pt, 1.5 Line Spacing, Justified]**
**[8-10 Primary Use Cases with Detailed Descriptions]**
**[UML Use Case Diagram with Clear Relationships]**
**[Patient-Centric Analysis Throughout]**
