# Chapter 2: Software Requirement Specifications

**[Font: Times New Roman, Size 12, Bold]**

---

## 2.1 Introduction

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This chapter presents the comprehensive Software Requirement Specifications (SRS) for the MediCare AI telemedicine platform. The SRS document provides detailed specifications of all functional and non-functional requirements necessary for the successful development and deployment of the system. This document serves as the primary contract between stakeholders, project managers, and the development team, ensuring clear understanding of system capabilities, constraints, and quality attributes. The requirements are organized by technology layers—Frontend, Backend, and AI Service—reflecting the microservices architecture of the platform. Each layer's requirements are comprehensively specified with unique identifiers, priorities, and measurable criteria to enable rigorous testing and validation during the development and quality assurance phases.

---

## 2.2 Purpose and Scope

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.2.1 Document Purpose

**[Font: Times New Roman, Size 11, Bold, Italicize]**

This Software Requirement Specifications document defines the functional and non-functional requirements for the MediCare AI platform (Version 1.0). The document specifies all user-visible features, system capabilities, performance constraints, security requirements, and quality attributes necessary to deliver a complete, integrated telemedicine solution. This SRS is intended to be used by the development team for implementation, quality assurance team for test case development and validation, project management for progress tracking and scope control, and stakeholders for verification that the delivered system meets their expectations and business requirements.

### 2.2.2 Product Scope

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI platform is a comprehensive web-based intelligent telemedicine system designed to provide healthcare accessibility in developing regions, specifically targeting Pakistan and similar markets. The product encompasses three integrated services: a React-based responsive web frontend, a Node.js/Express REST API backend, and a Python FastAPI artificial intelligence service. The integrated system provides users with two primary capabilities: (1) AI-powered preliminary medical assessment based on symptom descriptions grounded in authoritative medical literature, and (2) seamless connection with qualified medical professionals through intelligent appointment scheduling and secure video consultations. The platform supports two primary user roles: patients seeking health guidance and healthcare professionals managing their practices digitally.

The scope includes development of both patient-facing and doctor-facing interfaces, integration with external video consultation infrastructure, implementation of secure appointment scheduling with conflict prevention, and development of automated meeting documentation through audio transcription and summarization. The platform specifically excludes electronic health records (EHR) integration with existing hospital systems (designated as future enhancement), advanced analytics dashboards (reserved for Phase 2), and integration with pharmaceutical or medical supply chains. The first release focuses on establishing the core platform serving individual patients and independent practitioners.

---

## 2.3 Document Conventions and Typographical Standards

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

This SRS document follows the IEEE 830-1998 standard for software requirements specifications. The following conventions are employed throughout this document:

**Requirement Identification:** Each functional requirement is identified with a unique tag following the format: `REQ-[LAYER]-[SUBSYSTEM]-[NUMBER]`. For example:
- `REQ-FE-AUTH-001` indicates Frontend layer, Authentication subsystem, requirement 1
- `REQ-BE-APPT-005` indicates Backend layer, Appointment subsystem, requirement 5
- `REQ-AI-RAG-003` indicates AI Service layer, RAG subsystem, requirement 3

**Priority Levels:** Requirements are classified using the following priority scheme:
- **HIGH (H)**: Critical requirements essential for core functionality; system cannot function without these
- **MEDIUM (M)**: Important requirements providing significant value; system functions without them but with reduced capability
- **LOW (L)**: Nice-to-have requirements providing convenience; not essential for initial release

**Priority assignments at the requirement level supersede any parent-level priority assignments.**

**Performance Metrics:** Performance requirements are specified with explicit numerical targets and acceptable ranges (e.g., response time: 500ms ± 200ms). Where performance ranges are specified, the first value represents the target, and the range indicates acceptable variation under different operating conditions.

**Verification Methods:** Requirements include statements of how verification will be performed during testing:
- **Review** – Verification through design and code review
- **Test** – Verification through automated or manual testing
- **Demonstration** – Verification through live system demonstration
- **Analysis** – Verification through analytical evaluation

**Shall vs. Should:** The term "shall" indicates mandatory requirements that must be implemented. The term "should" indicates strongly recommended requirements that should be implemented unless there is compelling reason not to.

---

## 2.4 Intended Audience and Reading Guide

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.4.1 Audience Classification

**[Font: Times New Roman, Size 11, Bold, Italicize]**

This SRS document is structured to serve multiple audiences with different information needs:

**Software Developers** should focus on Section 2.6 (External Interface Requirements), Section 2.7 (System Features organized by technology layer), and Section 2.8 (Nonfunctional Requirements). These sections provide detailed technical specifications necessary for implementation, including API contracts, database schemas, and performance constraints.

**Quality Assurance and Testing Team** should prioritize Section 2.7 (System Features with stimulus/response sequences and functional requirements), Section 2.8.1 (Performance Requirements with measurable targets), and Section 2.8.3 (Security Requirements). These sections provide the basis for comprehensive test case development and acceptance criteria definition.

**Project Management and Business Stakeholders** should review Section 2.2 (Purpose and Scope), Section 2.5 (Product Perspective and Functions), and Section 2.9 (Business Rules) for understanding of system capabilities and constraints. These sections provide the business-level overview necessary for project planning and stakeholder communication.

**System Architects and Technical Leads** should review the complete document with special attention to Section 2.6 (External Interface Requirements) and the comprehensive feature specifications in Section 2.7 to understand system integration points and technical requirements.

### 2.4.2 Recommended Reading Sequence

**[Font: Times New Roman, Size 11, Bold, Italicize]**

For initial orientation to the document: Begin with Section 2.2 (Purpose and Scope) and Section 2.5 (Product Overview) to understand the system context and primary functions. Next, review Section 2.6 (External Interface Requirements) to understand how system components interact. Finally, proceed to the detailed feature requirements in Section 2.7 appropriate to your role.

For implementation-focused readers: After reviewing the orientation sections, focus on Section 2.6 (External Interface Requirements) for API and database contracts, then proceed to the technology layer-specific requirements in Section 2.7 (Frontend Requirements, Backend Requirements, AI Service Requirements).

For testing-focused readers: Review Section 2.7 (Stimulus/Response Sequences and Functional Requirements) to identify test scenarios, then cross-reference with Section 2.8 (Nonfunctional Requirements) for performance and quality acceptance criteria.

---

## 2.5 Product Overview and Functions

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.5.1 Product Perspective

**[Font: Times New Roman, Size 11, Bold, Italicize]**

MediCare AI is a self-contained web application representing a new solution to healthcare accessibility challenges in developing regions. The product is not a replacement for existing systems but rather a new entry into the telemedicine market addressing gaps not adequately served by current platforms. The system is specifically designed for independent healthcare practitioners, individual patients, and small healthcare facilities in developing markets rather than large hospital systems with existing integrated information systems.

The platform operates as an interconnected system of three independent microservices communicating over HTTP protocols. The Frontend service provides the user interface, the Backend service implements business logic and data management, and the AI Service provides intelligent medical assessment capabilities. These services are intentionally decoupled to enable independent scaling, maintenance, and enhancement of each component. The system integrates with external services including the VideoSDK.live API for video consultation infrastructure and the Groq API for Large Language Model access. These external integrations are mediated through the Backend and AI Service layers to maintain architectural coherence and simplify Frontend implementation.

### 2.5.2 Major System Functions

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI platform provides the following major functions to end users:

**Patient Functions:**
- User registration and account management for patients
- Symptom description and interactive AI-powered medical assessment
- Search and discovery of qualified healthcare professionals by specialty and location
- Real-time availability viewing and intelligent appointment scheduling
- Video consultation with scheduled healthcare professionals
- Access to digital prescriptions issued by doctors after completed consultations
- Access to meeting notes and consultation history
- Account profile management and preference settings

**Doctor Functions:**
- User registration and professional credential management
- Availability schedule creation and management
- Appointment management and consultation scheduling
- Real-time video consultation with patients
- Access to patient information and consultation history
- Digital prescription creation for completed consultations (diagnosis, medicines, vital signs, advice, follow-up date)
- View previously issued prescriptions per patient
- Meeting notes review and documentation
- Account and practice settings management

**System Functions:**
- Automated appointment conflict detection and prevention
- AI-powered medical knowledge retrieval and response generation
- Secure user authentication and authorization
- Encrypted communication between system components
- Real-time video and audio transmission
- Automatic audio transcription and consultation summarization
- Persistent storage and retrieval of user data, appointments, and consultations
- System monitoring and error handling

The following diagram illustrates the major system components and their relationships:

```
┌─────────────────────────────────────────────────────────────┐
│                    MediCare AI Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │  Patient Portal  │       │   Doctor Portal  │           │
│  │                  │       │                  │           │
│  │ • Symptom Check  │       │ • Schedule Mgmt  │           │
│  │ • Find Doctor    │       │ • Appointments   │           │
│  │ • Book Appt      │       │ • Consultations  │           │
│  │ • Consult        │       │ • Notes          │           │
│  └────────┬─────────┘       └────────┬─────────┘           │
│           │                         │                     │
│           └────────────┬────────────┘                     │
│                        │                                  │
│                        ▼                                  │
│         ┌──────────────────────────────┐                 │
│         │    REST API Backend           │                 │
│         │  (Node.js + Express)          │                 │
│         │                               │                 │
│         │ • Authentication              │                 │
│         │ • User Management             │                 │
│         │ • Appointment Scheduling      │                 │
│         │ • API Routing                 │                 │
│         └────────┬──────────────────────┘                 │
│                  │                                        │
│        ┌─────────┴────────────┐                           │
│        │                      │                           │
│        ▼                      ▼                           │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  MongoDB         │  │  AI Service      │              │
│  │  Database        │  │  (FastAPI)       │              │
│  │                  │  │                  │              │
│  │ • Users          │  │ • RAG Pipeline   │              │
│  │ • Appointments   │  │ • Transcription  │              │
│  │ • Schedules      │  │ • Summarization  │              │
│  │ • Chat History   │  │                  │              │
│  └──────────────────┘  └────────┬─────────┘              │
│                                 │                        │
│                       ┌─────────┴──────────┐             │
│                       │                    │             │
│                       ▼                    ▼             │
│                  ┌──────────────┐  ┌──────────────┐     │
│                  │ Groq API     │  │ VideoSDK.live│     │
│                  │ (LLaMA 3.1)  │  │ (Video Calls)│     │
│                  └──────────────┘  └──────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.5.3 User Classes and Characteristics

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The MediCare AI platform serves two primary user classes with distinct characteristics and requirements:

**User Class 1: Patients**
- **Frequency of Use**: Variable, typically 1-5 times per month
- **Technical Expertise**: Low to medium; includes users with limited digital literacy
- **Health Literacy**: Highly variable; ranges from health-conscious individuals to those with minimal medical knowledge
- **Primary Use Cases**: Seeking preliminary medical guidance, discovering healthcare providers, booking appointments, attending consultations
- **Device Preferences**: Mix of mobile devices (60%) and desktop computers (40%)
- **Accessibility Needs**: Must accommodate users in areas with low bandwidth (≤2 Mbps), variable connectivity, and diverse language preferences
- **Primary Motivation**: Access to affordable, convenient medical guidance and professional consultation
- **Most Important Requirements**: Ease of use, responsiveness on low-bandwidth networks, clear communication of medical guidance

**User Class 2: Healthcare Professionals (Doctors)**
- **Frequency of Use**: High; typically daily during working hours (8+ hours)
- **Technical Expertise**: Medium to high; expected to be comfortable with web applications and digital tools
- **Medical Expertise**: High; licensed healthcare professionals with medical qualifications
- **Primary Use Cases**: Managing availability, reviewing appointments, conducting consultations, accessing meeting notes
- **Device Preferences**: Mix of desktop computers (70%) and mobile devices (30%) for managing schedules
- **Geographic Distribution**: Concentrated in urban centers but with increasing presence in semi-urban areas
- **Primary Motivation**: Efficient practice management, reaching broader patient base, professional credentialing
- **Most Important Requirements**: Reliability, ease of schedule management, clear patient information, consultation quality

---

## 2.6 External Interface Requirements

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.6.1 User Interface Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

#### 2.6.1.1 Patient User Interface

**[Font: Times New Roman, Size 11, Bold, Italicize]**

The patient user interface shall provide a responsive, mobile-first design optimized for both desktop and mobile devices. The interface shall follow modern web application standards with clear navigation, intuitive workflows, and accessibility features.

**REQ-FE-UI-001: Responsive Design** | **Priority: HIGH**
The patient interface shall be fully responsive and display correctly on devices with screen widths from 320px (mobile) to 1920px (desktop). All interactive elements shall remain accessible and functional across all supported screen sizes. Touch targets shall be minimum 44px × 44px for mobile devices to ensure usability with touch input.

**REQ-FE-UI-002: Navigation Structure** | **Priority: HIGH**
The patient interface shall provide clear, hierarchical navigation enabling users to access all major functions without more than two clicks from the home page. Primary navigation elements shall include: Home, Symptom Checker, Find Doctors, My Appointments, and Account. Mobile interface shall include hamburger menu navigation collapsible on small screens.

**REQ-FE-UI-003: Symptom Checker Interface** | **Priority: HIGH**
The interface shall provide a free-text input field allowing patients to describe symptoms in natural language without predefined lists. The interface shall display AI responses in a clear, readable format with medical disclaimers prominently displayed. Response text shall be rendered using markdown formatting for structured presentation of medical information (headings, bullet points, emphasis).

**REQ-FE-UI-004: Doctor Discovery Interface** | **Priority: HIGH**
The interface shall display doctors in card layout with profile picture, name, specialty, and qualifications. Filtering controls shall enable sorting by specialty, availability, and rating. Search functionality shall support fuzzy matching on doctor names and specialties. Doctor cards shall include a "Book Appointment" call-to-action button.

**REQ-FE-UI-005: Appointment Booking Interface** | **Priority: HIGH**
The interface shall display available time slots in calendar format with date and time clearly indicated. Available slots shall be highlighted in green, booked slots in gray, and past slots hidden. Clicking a slot shall display confirmation dialog with doctor information, time, and price. The interface shall prevent selection of slots in the past and slots where the patient already has a conflicting appointment.

**REQ-FE-UI-006: Video Consultation Interface** | **Priority: HIGH**
The interface shall integrate VideoSDK prebuilt UI component for real-time video, audio, and screen sharing. The interface shall display remaining consultation time clearly and include end call button. The interface shall display participant names and connection status. Upon consultation completion, the interface shall display confirmation message and option to provide feedback.

**REQ-FE-UI-007: Accessibility Standards** | **Priority: MEDIUM**
The user interface shall meet WCAG 2.1 Level AA accessibility standards including color contrast ratios ≥ 4.5:1 for text, keyboard navigation support, and descriptive alt text for all images. The interface shall support screen reader navigation. All form inputs shall have associated labels.

**REQ-FE-UI-008: Visual Hierarchy and Branding** | **Priority: MEDIUM**
The interface shall employ consistent typography, color scheme, and spacing throughout all pages. All text shall use TailwindCSS default fonts optimized for readability (minimum 14px on mobile, 16px on desktop). Color palette shall be consistent with healthcare industry standards emphasizing trust and professionalism. All UI elements shall follow TailwindCSS component design patterns.

#### 2.6.1.2 Doctor User Interface

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-FE-UI-009: Doctor Dashboard Layout** | **Priority: HIGH**
The doctor interface shall display a dashboard showing upcoming appointments, pending consultations, and schedule management options. The dashboard shall show real-time updates without requiring page refresh. Key metrics displayed shall include: number of appointments today, total patients, and consultation completion rate.

**REQ-FE-UI-010: Schedule Management Interface** | **Priority: HIGH**
The schedule management interface shall provide calendar view with date selection and time slot configuration. Doctors shall be able to select multiple dates and configure time slots with 15-minute granularity. The interface shall display slot creation summary (e.g., "Creating 16 slots from 9:00 to 17:00") before confirmation. Bulk delete of all slots on a date shall be supported with confirmation dialog.

**REQ-FE-UI-011: Appointment List Interface** | **Priority: HIGH**
The appointments list shall display doctor's appointments in chronological order with patient name, appointment time, status (upcoming/ongoing/completed), and action buttons. For upcoming appointments, a "Join Consultation" button shall be present. For completed appointments, "View Notes" button shall access meeting documentation.

**REQ-FE-UI-012: Profile Management Interface** | **Priority: MEDIUM**
The doctor profile page shall allow editing of personal information (name, phone), professional details (specialty, qualifications), and profile picture. Profile picture upload shall support JPG and PNG formats up to 5MB. The interface shall show current profile information and preview of updated information before saving.

### 2.6.2 Hardware Interface Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-HW-001: Supported Device Types** | **Priority: MEDIUM**
The system shall support the following device types: Desktop computers (Windows 7+, macOS 10.12+, Linux), Tablets (iPad 6th generation or newer, Android 8+), Smartphones (iOS 12+, Android 8+). The system shall gracefully handle devices with various hardware capabilities including limited RAM (≥512MB), limited storage (≥100MB available), and limited processing power.

**REQ-HW-002: Network Interface** | **Priority: HIGH**
The system shall function over standard internet connections including broadband (≥10 Mbps), mobile networks (3G/4G/5G), and low-bandwidth connections (2-10 Mbps with degraded experience). The system shall employ data compression and bandwidth optimization techniques to minimize data transfer. Video consultation shall automatically adjust quality based on available bandwidth.

**REQ-HW-003: Microphone and Camera** | **Priority: HIGH**
For video consultation, the system shall detect and request permission to access device microphone and camera. The system shall support built-in device microphones/cameras and external USB devices. The system shall provide clear feedback when microphone or camera is unavailable.

**REQ-HW-004: Geolocation** | **Priority: LOW**
The system may optionally request geolocation permission to filter doctors by proximity (not in scope for version 1.0 but infrastructure shall support future implementation).

### 2.6.3 Software Interface Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

#### 2.6.3.1 Frontend to Backend Communication

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-SI-FB-001: REST API Communication** | **Priority: HIGH**
The Frontend service shall communicate with the Backend service exclusively through RESTful HTTP(S) APIs. All requests shall include appropriate HTTP methods (GET, POST, PUT, DELETE) and follow REST naming conventions. The Backend shall run on localhost:4000 in development and shall be configurable for production deployment.

**REQ-SI-FB-002: Authentication Token Handling** | **Priority: HIGH**
The Frontend shall automatically include JWT authentication tokens in all API requests through httpOnly cookies. The Frontend shall handle token expiration gracefully, detecting 401 Unauthorized responses and redirecting to appropriate login page. Token refresh shall be transparent to the user without disrupting active sessions.

**REQ-SI-FB-003: Request/Response Format** | **Priority: HIGH**
All API requests and responses shall use JSON format. All requests shall include Content-Type: application/json header. Error responses shall include HTTP status code and error message in consistent format: `{ "error": "error message", "code": "ERROR_CODE" }`.

**REQ-SI-FB-004: API Response Time** | **Priority: HIGH**
Backend API responses shall complete within 500ms ± 200ms for non-AI queries (authentication, appointment listing, doctor search). AI-related queries may extend response time to 3000ms ± 1000ms depending on query complexity and system load.

**REQ-SI-FB-005: Concurrent Request Handling** | **Priority: MEDIUM**
The Frontend shall support concurrent requests from multiple browser tabs/windows for the same user. The system shall maintain consistent state across concurrent operations, preventing race conditions in appointment booking.

#### 2.6.3.2 Backend to AI Service Communication

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-SI-BA-001: AI Service Integration** | **Priority: HIGH**
The Backend service shall communicate with the AI Service exclusively through HTTP REST calls. The AI Service shall run on localhost:8000 in development. All communication shall use JSON request/response format with UTF-8 encoding.

**REQ-SI-BA-002: Chat Endpoint** | **Priority: HIGH**
Backend shall proxy chat requests to the AI Service POST /chat endpoint, passing user message and session ID. The AI Service shall return structured response including: response text, relevant sources, retrieved documents, and confidence scores. Response shall include medical disclaimer and emergency symptom alerts if applicable.

**REQ-SI-BA-003: Transcription Service** | **Priority: MEDIUM**
Backend shall send audio files to AI Service POST /transcribe endpoint for conversion to text. AI Service shall use faster-whisper small model for transcription. Response shall include transcribed text and confidence scores per utterance.

**REQ-SI-BA-004: Summarization Service** | **Priority: MEDIUM**
Backend shall send meeting transcripts to AI Service POST /summarize endpoint with doctor name and patient name. AI Service shall return structured summary including: consultation summary, key findings, recommendations, and follow-up items formatted as markdown.

**REQ-SI-BA-005: Error Handling** | **Priority: HIGH**
If AI Service is unavailable, Backend shall return 503 Service Unavailable with message "AI Service temporarily unavailable. Please try again later." Backend shall not cascade timeouts—AI Service requests shall timeout after 30 seconds maximum.

#### 2.6.3.3 Database Interfaces

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-SI-DB-001: MongoDB Connection** | **Priority: HIGH**
The Backend service shall connect to MongoDB database named "MediCare" (default: mongodb://localhost:27017/MediCare). The system shall use Mongoose 9.1.1 ODM for data access. Database connection pool shall maintain 5-10 active connections in development and configurable pool size in production (recommended 20-50).

**REQ-SI-DB-002: Data Collections** | **Priority: HIGH**
The database shall maintain the following collections: patients, doctors, schedules, appointments, chats, meetingNotes, reviews. Each collection shall have appropriate indexes on commonly queried fields to ensure query performance.

**REQ-SI-DB-003: Query Performance** | **Priority: MEDIUM**
Database queries shall complete within 100-300ms for simple queries (patient lookup by ID, doctor listing) and 300-800ms for complex queries (appointment search with filters, schedule availability lookup). Complex queries shall employ database indexing and query optimization to meet performance targets.

**REQ-SI-DB-004: Data Persistence** | **Priority: HIGH**
All user data, appointments, and conversations shall be persisted in MongoDB. The system shall support data backup and recovery procedures. Database backups shall be performed daily.

### 2.6.4 Communication Interface Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-COMM-001: HTTPS Encryption** | **Priority: HIGH**
All communication between Frontend and Backend, and between Backend and AI Service, shall use HTTPS in production environments. Communications shall use TLS 1.2 or higher. Self-signed certificates acceptable in development environments.

**REQ-COMM-002: CORS Configuration** | **Priority: HIGH**
Backend shall configure Cross-Origin Resource Sharing (CORS) to allow requests from Frontend origin (http://localhost:5173 in development). CORS headers shall explicitly list allowed origins, methods (GET, POST, PUT, DELETE), and headers. Wildcard origins (*) shall not be used in production.

**REQ-COMM-003: VideoSDK API Integration** | **Priority: HIGH**
Backend shall integrate with VideoSDK.live REST API to create video rooms and generate JWT tokens. VideoSDK API calls shall include API key authentication. Room creation requests shall include participant limit (2-4 for initial version) and configuration parameters.

**REQ-COMM-004: Groq API Integration** | **Priority: HIGH**
AI Service shall integrate with Groq API for LLaMA 3.1 8B model access. Groq API requests shall include API key authentication. Requests shall be sent with temperature parameter 0.3 for controlled, deterministic responses. Rate limiting shall not exceed 10 requests per minute (configured in Groq account).

**REQ-COMM-005: Video Transmission Quality** | **Priority: HIGH**
Video consultation shall support minimum bandwidth of 2 Mbps for audio-only and 4 Mbps for video at 720p resolution. System shall automatically degrade video quality under low-bandwidth conditions to maintain call stability. Audio quality shall always be prioritized over video quality.

**REQ-COMM-006: Session Management** | **Priority: HIGH**
HTTP sessions shall use httpOnly, Secure cookies with 6-hour expiration for authentication tokens. Cookies shall not be accessible to JavaScript to prevent XSS attacks. Session data shall be server-side in MongoDB to prevent session hijacking.

---

## 2.7 System Features by Technology Layer

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.7.1 Frontend Service Features

**[Font: Times New Roman, Size 11, Bold, Italicize]**

#### Feature FE-1: User Authentication and Authorization

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
User authentication and authorization provide the security foundation for the entire system, ensuring that only legitimate users can access protected resources and that doctors and patients can only access resources appropriate to their role. This feature is critical to patient privacy, doctor practice management, and system integrity. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Patient Registration*
1. User clicks "Sign Up" button on landing page
2. System displays patient registration form requesting: first name, last name, email, password, age, gender
3. User enters information and clicks "Create Account"
4. System validates input (email uniqueness, password complexity)
5. System hashes password using bcrypt and creates patient record in database
6. System displays confirmation message and redirects to dashboard
7. System sets authentication cookie

*Scenario 2 - Patient Login*
1. User clicks "Login" button
2. System displays login form requesting: email, password
3. User enters credentials and clicks "Sign In"
4. System validates credentials against hashed password
5. If valid: system generates JWT token, sets httpOnly cookie, stores patient name in localStorage for UI display, redirects to dashboard
6. If invalid: system displays error message "Invalid email or password"

*Scenario 3 - Session Expiration*
1. User is logged in and interacts with system
2. After 6 hours of token issuance, user attempts to perform action requiring authentication
3. Backend returns 401 Unauthorized response
4. Frontend automatically redirects to login page with message "Your session has expired. Please log in again."
5. User re-enters credentials to establish new session

**Functional Requirements:**

REQ-FE-AUTH-001: **Patient Registration Form** | **Priority: HIGH**
The system shall display a registration form requesting: first name (required, text), last name (required, text), email (required, valid email format), password (required, minimum 8 characters with 1 uppercase, 1 lowercase, 1 number, 1 special character), age (optional, numeric), gender (optional, select: Male/Female/Other). Form shall display validation errors inline for each field. Password confirmation field shall require exact match to password field. Email field shall validate uniqueness against existing patients—duplicate emails shall display error "This email is already registered."

REQ-FE-AUTH-002: **Doctor Registration Form** | **Priority: HIGH**
The system shall display doctor registration form requesting: first name (required), last name (required), email (required, unique), password (required, same complexity as patients), phone number (required, 11 digits for Pakistan), specialty (required, select from predefined list), degrees (required, comma-separated list, minimum 1), profile picture (required, JPG/PNG, maximum 5MB). Form shall validate file size and type for profile picture upload. Upon successful registration, profile picture shall be uploaded to backend storage and filename persisted in database. System shall display success message and redirect to doctor dashboard.

REQ-FE-AUTH-003: **Login Form Behavior** | **Priority: HIGH**
Login form shall accept email and password. System shall validate credentials against backend. Upon successful authentication, system shall receive authentication token via httpOnly cookie and store user type (patient/doctor) and user name in localStorage (names only, not sensitive data). Upon authentication failure after 3 attempts, system shall display warning message and disable login button for 30 seconds to prevent brute force attacks. 

REQ-FE-AUTH-004: **Role-Based Access Control** | **Priority: HIGH**
Frontend shall implement route-level access control using PrivateRoute component for patient-protected routes and doctor-protected routes. Patient routes (/patient/*) shall check localStorage for patientData; doctor routes (/doctor/*) shall check localStorage for doctorName. Unauthorized access attempts shall redirect to appropriate login page. Route guards shall verify token validity on page load using backend endpoint.

REQ-FE-AUTH-005: **Logout Functionality** | **Priority: HIGH**
Logout button shall be available on all protected pages. Clicking logout shall call backend logout endpoint, clear authentication cookie, clear localStorage entries, and redirect to home page. System shall display confirmation message "You have been logged out successfully."

REQ-FE-AUTH-006: **Password Reset** | **Priority: MEDIUM**
Login page shall include "Forgot Password?" link. Clicking shall display email entry form. System shall send password reset email (not implemented in v1.0, placeholder for future). Password reset token shall expire after 1 hour.

REQ-FE-AUTH-007: **Token Refresh** | **Priority: MEDIUM**
System shall automatically refresh authentication tokens before expiration to prevent session loss during active use. Token refresh shall be transparent to user without page reload or visible notification.

**Verification Method:** Test through manual user registration, login, logout flows on both patient and doctor interfaces.

---

#### Feature FE-2: Patient Symptom Checker Interface

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
The symptom checker interface enables patients to describe health concerns in natural language and receive evidence-based preliminary medical assessment. This is the core differentiator of MediCare and must be highly intuitive, responsive, and clearly communicate medical disclaimers. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - New Chat Initiation*
1. Patient clicks "Symptom Checker" in main navigation
2. System displays empty chat interface with prompt "Describe your symptoms..."
3. System loads previous chat history if exists, displaying past conversations in sidebar
4. Patient types symptom description (e.g., "I have been having headaches for 3 days with fever")
5. Patient clicks "Send" or presses Enter
6. System displays loading indicator and calls backend API to create new chat session and send message to AI Service
7. Backend returns session ID and initial AI response
8. System displays medical disclaimer at top: "⚠️ This AI assessment is for informational purposes only and does not constitute medical advice..."
9. System displays AI response with structured sections: symptoms understanding, possible conditions, general treatment, when to seek care
10. System appends response to chat history for context preservation

*Scenario 2 - Follow-up Question*
1. Patient reviews AI response and asks follow-up question in same chat (e.g., "Is this serious?")
2. Patient sends message
3. System sends message to backend with existing session ID
4. Backend maintains chat history context (last 10 messages to manage token limits)
5. AI Service generates response considering previous context
6. System displays response with appropriate medical disclaimers
7. Chat history updates to show exchange

*Scenario 3 - Emergency Detection*
1. Patient describes symptoms with emergency indicators (e.g., "chest pain and difficulty breathing")
2. AI Service detects emergency symptoms in response generation
3. System displays urgent warning: "🚨 EMERGENCY SYMPTOMS DETECTED: If you are experiencing chest pain and difficulty breathing, call emergency services (15) immediately. Do not rely on this assessment."
4. Warning is displayed prominently above other content
5. System provides direct link/button to call emergency services

**Functional Requirements:**

REQ-FE-SYM-001: **Chat Interface Layout** | **Priority: HIGH**
Chat interface shall display in two columns on desktop (chat history on left, current chat on right) or single column on mobile. Chat history shall show previous conversations with date/time stamps. Current chat shall display message thread with user messages on right (blue background) and AI responses on left (gray background). Each message shall show timestamp and message sender identifier.

REQ-FE-SYM-002: **Message Input** | **Priority: HIGH**
Message input field shall be a textarea supporting multi-line input. Minimum input length: 10 characters. Maximum input length: 5000 characters. Character count shall display below input field. Submit button shall be disabled until input meets minimum length. Message shall be sent on clicking submit button or pressing Ctrl+Enter / Cmd+Enter.

REQ-FE-SYM-003: **AI Response Display** | **Priority: HIGH**
AI responses shall be rendered using markdown formatting including: headings (rendered with appropriate font sizes), bullet points (rendered with bullet symbols), bold text (**text**), italics (*text*). Code blocks shall be rendered with monospace font. Response shall include medical disclaimer at the top: "⚠️ This assessment is based on artificial intelligence analysis of your symptoms and does not replace professional medical evaluation."

REQ-FE-SYM-004: **Response Sections Structure** | **Priority: HIGH**
AI responses shall be formatted with standardized sections: 📋 Understanding Your Symptoms (rephrasing patient's described symptoms), 🔍 Possible Conditions (list of conditions that match symptoms with likelihood), 💊 General Treatment Approaches (general treatment information), 💉 Medications Commonly Used (medication categories without specific prescription), 🏥 Precautionary Measures (preventive actions), 👨‍⚕️ When to Seek Medical Care (red flags requiring professional attention), ⚕️ Next Steps Recommendation (recommendation to seek professional consultation if appropriate).

REQ-FE-SYM-005: **Emergency Symptom Detection Display** | **Priority: HIGH**
When AI detects emergency symptoms (chest pain, severe bleeding, difficulty breathing, severe allergic reaction, loss of consciousness, etc.), system shall display warning box with red background containing: 🚨 EMERGENCY SYMPTOMS DETECTED message, specific symptoms detected, immediate action required, emergency number (15 for Pakistan), and button to call emergency services (if supported by device).

REQ-FE-SYM-006: **Chat History Management** | **Priority: MEDIUM**
System shall maintain chat history for each patient showing all previous conversations. Each conversation shall be listed with title (first few words of first message), date, time, and last message preview. Clicking previous conversation shall load chat history. Deleting conversation shall remove it from history after confirmation dialog. Each conversation shall have unique session ID stored in backend.

REQ-FE-SYM-007: **Typing Indicators** | **Priority: MEDIUM**
While system is processing AI response, message input area shall display "AI is thinking..." text with animated dots. Response loading time shall be displayed ("Estimated time: 3-5 seconds").

REQ-FE-SYM-008: **Disclaimer and Medical Disclaimers** | **Priority: HIGH**
All responses shall include medical disclaimer at top. Additional disclaimers shall appear if response discusses serious conditions or medications. Disclaimer shall be non-dismissible but shall not block access to full response. System shall include link to full terms of use and medical disclaimer page.

**Verification Method:** Manual testing of various symptom inputs, verification of emergency detection, testing of chat history persistence.

---

#### Feature FE-3: Doctor Discovery and Filtering

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
The doctor discovery feature enables patients to find healthcare professionals matching their needs through search and filtering. Efficient discovery is critical for patient engagement and booking conversion. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Browse All Doctors*
1. Patient clicks "Find Doctors" in main navigation
2. System calls backend API GET /View_Doctor to retrieve all doctors
3. System displays doctor cards in grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
4. Each card displays: profile picture, name, specialty, degrees, and "Book Appointment" button
5. Patient scrolls through doctor listings

*Scenario 2 - Filter by Specialty*
1. Patient views doctor listing page
2. Patient clicks filter button or dropdown for "Specialty"
3. System displays specialty options: General Practice, Cardiology, Pediatrics, Orthopedics, etc.
4. Patient selects "Cardiology"
5. System filters displayed doctors to show only cardiologists
6. Doctor count updates (e.g., "Showing 8 cardiologists")

*Scenario 3 - Search by Name*
1. Patient clicks search field
2. Patient types doctor name
3. System performs real-time filtering showing matching doctors
4. If no matches, system displays "No doctors found matching 'Dr. Smith'"

**Functional Requirements:**

REQ-FE-DOC-001: **Doctor Listing Grid** | **Priority: HIGH**
Doctors shall be displayed in responsive grid layout with 1 column on mobile (width < 768px), 2 columns on tablet (768px - 1024px), 3 columns on desktop (> 1024px). Each doctor card shall display: profile picture (150px × 150px), full name (font size 18px bold), specialty (font size 14px), comma-separated degrees (font size 12px), and "Book Appointment" button. Cards shall be clickable to view doctor detail page. Cards shall display average rating (if reviews implemented) with star rating (0-5 stars).

REQ-FE-DOC-002: **Specialty Filter** | **Priority: HIGH**
Filter panel shall display checkbox list of medical specialties with counts of doctors in each specialty (e.g., "General Practice (15)", "Cardiology (8)"). Selecting specialties shall filter displayed doctors. Multiple specialty selection shall be supported (OR logic). "Show All" option shall reset filter. Specialty list shall be populated from backend.

REQ-FE-DOC-003: **Search Functionality** | **Priority: HIGH**
Search field shall support real-time filtering by doctor name. Filtering shall be case-insensitive and support partial name matching. As user types, matching doctors shall be displayed dynamically. Search shall also match specialty names. Clear (×) button shall be available in search field to reset search.

REQ-FE-DOC-004: **Doctor Detail Page** | **Priority: MEDIUM**
Clicking doctor card or name shall navigate to detail page displaying: large profile picture, full name, specialty, all qualifications/degrees, location/clinic information (if available), patient rating (if reviews implemented), "Book Appointment" button. Detail page shall show available appointment slots or link to booking page.

REQ-FE-DOC-005: **Availability Status** | **Priority: MEDIUM**
Doctor card shall display availability status: "Available Today" (green badge) if doctor has available slots today, "Available This Week" if available within 7 days, or "Fully Booked" if no slots available in next 30 days.

REQ-FE-DOC-006: **Responsive Layout Adaptation** | **Priority: MEDIUM**
On mobile devices, search and filter controls shall collapse into a filter menu (hamburger icon) to save screen space. Applying filters shall show "X filters applied" with option to clear all filters. Doctor card shall stack vertically on mobile with full-width layout.

**Verification Method:** Test doctor listing display, filter functionality, search functionality across different screen sizes.

---

#### Feature FE-4: Appointment Booking

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Appointment booking is a critical revenue-generating feature and must be robust, user-friendly, and prevent double-booking or scheduling conflicts. The booking flow must guide patients from slot selection through payment confirmation. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - View Available Slots*
1. Patient clicks "Book Appointment" button from doctor card or detail page
2. System navigates to booking page for selected doctor
3. System calls backend API GET /Show_Appoitment_Sechdule/:doctorId to retrieve available slots
4. System displays calendar view of next 30 days with available dates highlighted
5. Patient clicks on specific date
6. System displays available time slots for that date in table format: time, duration, fee
7. Booked slots are grayed out and unclickable
8. Past slots are hidden

*Scenario 2 - Select and Confirm Slot*
1. Patient clicks on available time slot
2. System displays confirmation dialog showing: doctor name, date, time, duration, consultation fee, total cost
3. Patient clicks "Confirm Booking"
4. System calls backend API POST /Book_Appointment/:scheduleId
5. Backend checks for conflicts, creates VideoSDK room, creates appointment record
6. System displays confirmation: "Appointment booked successfully for [date] at [time]"
7. System displays appointment details and adds to patient's appointment list
8. System offers option to add to calendar, share appointment, or return to doctor listing

*Scenario 3 - Conflict Detection*
1. Patient selects time slot that overlaps with existing appointment on same day
2. System detects conflict and displays warning: "You already have an appointment on this date. Overlapping appointments are not allowed. Please select a different time."
3. Slot remains unselectable
4. Patient must select different date/time

**Functional Requirements:**

REQ-FE-APT-001: **Calendar View** | **Priority: HIGH**
Calendar shall display in month view on desktop and week view on mobile. Available dates shall be highlighted in green, fully booked dates in gray, past dates in light gray (disabled). Clicking date shall show available slots for that date. Only dates within next 30 days shall be displayed. Weekend availability shall be shown based on doctor's actual schedule (not automatically hidden).

REQ-FE-APT-002: **Time Slot Display** | **Priority: HIGH**
Available slots shall be displayed in table format with columns: Time (HH:MM format), Duration (15, 30, 45, 60 minutes), Fee (PKR currency with symbol). Slots shall be listed chronologically. Booked slots shall be displayed in gray with "Booked" label and not clickable. Current or past slots (relative to current time) shall not be displayed. Free slots shall have white background with "Available" label and be clickable.

REQ-FE-APT-003: **Conflict Prevention** | **Priority: HIGH**
System shall check backend for existing patient appointments overlapping the selected date. If patient already has appointment on that date, all overlapping time slots shall be disabled with message "You have conflicting appointment: [time]. Select different time or date." Selection of conflicting slot shall show warning dialog preventing booking.

REQ-FE-APT-004: **Confirmation Dialog** | **Priority: HIGH**
Before confirming booking, system shall display dialog with: doctor's name, photo (small thumbnail), appointment date (formatted as "Monday, January 15, 2024"), appointment time ("2:30 PM - 2:45 PM"), appointment duration, consultation fee with PKR symbol, total cost, and buttons "Confirm" and "Cancel". Dialog shall be modal and prevent interaction with page content until confirmed or cancelled.

REQ-FE-APT-005: **Booking Success Message** | **Priority: HIGH**
Upon successful booking, system shall display success message: "✓ Appointment booked successfully!" with details: doctor name, date, time, and confirmation number (appointment ID). Options shall be: "View My Appointments" (navigates to appointments list), "Book Another" (resets form), "Go Home" (navigates to dashboard).

REQ-FE-APT-006: **Slot Availability Real-time Update** | **Priority: MEDIUM**
If another patient books same slot while viewing, system shall disable that slot without refreshing page. A notification banner shall indicate "Availability updated" with option to refresh availability. System shall poll backend every 10 seconds for availability changes while booking page is open.

REQ-FE-APT-007: **Responsive Booking Flow** | **Priority: MEDIUM**
On mobile, calendar shall default to week view instead of month view. Time slots shall display in vertical list format. Font sizes shall increase for touch input accessibility. Confirmation dialog shall be full-screen on mobile with scrollable content.

**Verification Method:** Test complete booking flow, verify conflict detection, test real-time availability updates, verify responsive behavior.

---

### 2.7.2 Backend Service Features

**[Font: Times New Roman, Size 11, Bold, Italicize]**

#### Feature BE-1: User Management and Authentication

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
User management implements secure account creation, authentication, and authorization for both patients and doctors. JWT-based stateless authentication with httpOnly cookies provides security against XSS attacks while maintaining scalability. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Patient Registration (Backend Processing)*
1. Frontend sends POST /P_SignUp with: firstName, lastName, email, password, age, gender
2. Backend validates input (email uniqueness, password complexity)
3. Backend hashes password using bcrypt (salt rounds: 10)
4. Backend creates Patient document in MongoDB with hashed password
5. Backend generates JWT token using P_SecretKey with 6-hour expiry
6. Backend returns token in httpOnly cookie with success response
7. Frontend receives response and redirects to dashboard

*Scenario 2 - Doctor Registration (Backend Processing)*
1. Frontend sends POST /D_SignUP with multipart/form-data including: firstName, lastName, email, password, phone, specialty, degrees[], profile_Picture file
2. Backend validates email uniqueness
3. Backend validates file upload (JPG/PNG, < 5MB)
4. Backend saves profile picture to /public/pictures/ directory with unique filename
5. Backend hashes password using bcrypt
6. Backend creates Doctor document with profile picture filename
7. Backend generates JWT token using SecretKey with 6-hour expiry
8. Backend returns token and success response

*Scenario 3 - Patient Login (Backend Processing)*
1. Frontend sends POST /P_Login with: email, password
2. Backend retrieves patient by email
3. Backend compares provided password with stored hash using bcrypt.compare()
4. If match: generates JWT token (6-hour expiry), returns in httpOnly cookie
5. If no match: returns 401 Unauthorized with error "Invalid email or password"
6. Frontend receives token and allows access to patient routes

**Functional Requirements:**

REQ-BE-AUTH-001: **Patient Registration Validation** | **Priority: HIGH**
Backend shall validate patient registration requests: email format (RFC 5322), email uniqueness (query existing patients), password minimum 8 characters with requirements (1 uppercase, 1 lowercase, 1 number, 1 special character), firstName and lastName non-empty (1-50 characters), age optional (18-120 range if provided), gender optional (enum: Male/Female/Other). Validation errors shall return 400 Bad Request with specific field errors. Duplicate email shall return 409 Conflict.

REQ-BE-AUTH-002: **Doctor Registration Validation** | **Priority: HIGH**
Backend shall validate doctor registration: same email and password validation as patients, phone number valid format (11 digits for Pakistan), specialty non-empty string (matched against predefined specialty list), degrees array non-empty (each degree 1-100 characters), profile picture file uploaded (validation: JPG/PNG only, file size ≤ 5MB). File upload shall use multer middleware with filename sanitization to prevent directory traversal attacks. Invalid file shall return 400 Bad Request.

REQ-BE-AUTH-003: **Password Hashing** | **Priority: HIGH**
All user passwords shall be hashed using bcrypt with salt rounds = 10 before storage in database. Raw passwords shall never be stored or logged. Password comparisons shall use bcrypt.compare() for authentication.

REQ-BE-AUTH-004: **JWT Token Generation** | **Priority: HIGH**
Upon successful authentication, system shall generate JWT token containing: user ID, user type (patient/doctor), email, iat (issued at), exp (expiration: current_time + 6 hours). Tokens shall be signed using asymmetric keys (P_SecretKey for patients, SecretKey for doctors). Token shall be returned in httpOnly, Secure, SameSite=Strict cookie named "token".

REQ-BE-AUTH-005: **Authentication Middleware** | **Priority: HIGH**
Backend shall implement authentication middleware checking every protected route request: verify JWT token in cookie using appropriate secret key, extract user ID from token, set req.PatientId (for patients) or req.doctorId (for doctors), pass to route handler. Invalid/expired token shall return 401 Unauthorized. Missing token on protected route shall return 401.

REQ-BE-AUTH-006: **Cookie Security** | **Priority: HIGH**
Authentication cookies shall have properties: httpOnly=true (prevent JavaScript access), Secure=true (HTTPS only in production), SameSite=Strict (prevent CSRF attacks), Max-Age=21600 (6 hours in seconds), Path=/. Cookies shall be cleared on logout endpoint.

REQ-BE-AUTH-007: **Login Rate Limiting** | **Priority: MEDIUM**
Backend shall implement rate limiting on login endpoints: maximum 5 failed login attempts per email address per 15-minute window. After 5 failures, account shall be locked for 15 minutes. Locked account shall return 429 Too Many Requests with message "Too many failed login attempts. Please try again in 15 minutes."

REQ-BE-AUTH-008: **Logout Endpoint** | **Priority: HIGH**
Backend shall implement GET /logout and GET /Doctor_Logout endpoints that clear authentication cookie by setting Max-Age=0 and return success response. Subsequent requests using cleared cookie shall return 401 Unauthorized.

**Verification Method:** Test registration validation, password hashing, JWT token generation and validation, authentication middleware enforcement, rate limiting.

---

#### Feature BE-2: Appointment Scheduling and Management

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Appointment scheduling manages doctor availability, patient bookings, and appointment lifecycle. Robust conflict detection and real-time synchronization are critical to prevent double-booking and ensure system reliability. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Create Doctor Schedule*
1. Doctor sends POST /Add_Sechdule with: dates[], slots[], slotDuration, clinic_fee
2. Backend validates: dates are not in past, date format is valid
3. Backend rejects past dates with error "Cannot create schedules in the past"
4. For each date/slot combination, backend creates Schedule document: { doctor: ObjectId, date, startTime, endTime, status: 'available', clinic_fee, slotDuration }
5. Backend prevents duplicates with unique index on (doctor, date, startTime)
6. Backend returns success with count of created schedules: "Created 16 slots"
7. Schedules appear in doctor's schedule management view

*Scenario 2 - View and Auto-Cancel Expired Schedules*
1. Doctor sends GET /Show_Doctor_Sechdule
2. Backend retrieves all Schedule documents for this doctor
3. Backend runs auto-cancellation logic: for each schedule, if date < today (midnight boundary) OR (date = today AND endTime < current_time), set status='cancelled'
4. Backend returns remaining active schedules grouped by date
5. Cancelled schedules not returned to doctor (kept in database for audit trail)

*Scenario 3 - Book Appointment*
1. Patient sends POST /Book_Appointment/:scheduleId
2. Backend retrieves Schedule document (validate exists, status='available')
3. Backend checks for patient conflicts: query Appointment collection for appointments where patient_id=this_patient AND appointment date = schedule date AND time overlaps
4. If conflict exists: return 409 Conflict with message "You have conflicting appointment"
5. If no conflict: create VideoSDK room via REST API
6. Backend creates Appointment document: { patient_id, doctor_id, schedule_id, meeting_id, status: 'booked' }
7. Backend updates Schedule status to 'booked'
8. Backend returns success response with appointment ID and meeting details
9. Appointment appears in patient's appointment list and doctor's appointment list

*Scenario 4 - Join Video Consultation*
1. Patient/doctor sends GET /join-meeting/:roomId at appointed time
2. Backend retrieves appointment by meeting_id
3. Backend validates timing: is today = appointment date? is current_time within window (startTime - 5 minutes to endTime + 5 minutes)?
4. If timing invalid: return 403 Forbidden with message "It is not time for your appointment yet" or "Appointment time has passed"
5. If timing valid: set appointment status to 'ongoing', schedule timeout to mark 'completed' when endTime passes
6. Backend generates VideoSDK JWT token valid for consultation duration
7. Backend returns token and remaining_time (seconds until appointment end)
8. Frontend initializes VideoSDK with token and room ID

**Functional Requirements:**

REQ-BE-APT-001: **Schedule Creation Validation** | **Priority: HIGH**
POST /Add_Sechdule shall validate: dates array non-empty and all dates in valid date format (YYYY-MM-DD), all dates ≥ today, slots array non-empty and all times in HH:MM format (24-hour), slotDuration positive integer (15-120 minutes), clinic_fee positive number (PKR). Requests with invalid dates (past dates) shall return 400 Bad Request. Requests shall support bulk creation of multiple date-time combinations in single request (atomic transaction).

REQ-BE-APT-002: **Duplicate Slot Prevention** | **Priority: HIGH**
MongoDB collection shall have unique compound index on (doctor, date, startTime) preventing creation of duplicate slots for same doctor on same date/time. Attempting to create duplicate slot shall return 409 Conflict error. This provides database-level enforcement of uniqueness constraint.

REQ-BE-APT-003: **Auto-Cancellation Logic** | **Priority: HIGH**
GET /Show_Doctor_Sechdule endpoint shall implement auto-cancellation: for each schedule, if date < today (comparing at midnight boundary using moment.js or equivalent) OR (date equals today AND endTime < current moment), automatically update status to 'cancelled'. Cancelled schedules shall not be returned in response but shall be retained in database. Auto-cancellation shall be idempotent (safe to call multiple times).

REQ-BE-APT-004: **Appointment Conflict Detection** | **Priority: HIGH**
POST /Book_Appointment/:scheduleId shall query Appointment collection: find appointments where (patient_id = this_patient) AND (appointment.schedule.date = booking_schedule.date) AND time ranges overlap. Overlapping appointments shall prevent booking with 409 Conflict response. Time overlap definition: start_time < other_end_time AND end_time > other_start_time.

REQ-BE-APT-005: **VideoSDK Room Creation** | **Priority: HIGH**
Upon successful appointment creation, backend shall call VideoSDK REST API to create room: POST to VideoSDK API with headers including Authorization (API key), body including room_id (unique identifier), and configuration parameters. If VideoSDK API fails, transaction shall rollback and appointment creation shall fail with 503 Service Unavailable. Meeting room ID shall be stored in Appointment document as meeting_id.

REQ-BE-APT-006: **Time Window Validation** | **Priority: HIGH**
GET /join-meeting/:roomId shall validate appointment timing: fetch appointment by meeting_id, retrieve associated schedule, check if current_date equals schedule.date, check if current_time is within window [schedule.startTime - 5 minutes, schedule.endTime + 5 minutes]. Early joining allowed 5 minutes before start. Joining after end time denied with message "Appointment time has passed." Joining before start time denied with message "Appointment has not started yet."

REQ-BE-APT-007: **Appointment Status Lifecycle** | **Priority: HIGH**
Appointments shall follow status lifecycle: 'booked' (initial state after booking) → 'ongoing' (when time window is reached and user joins) → 'completed' (when appointment duration expires). Backend shall automatically transition from 'ongoing' to 'completed' using setTimeout at appointment endTime. Manual status transitions via API endpoints shall be prevented (status controlled by system logic).

REQ-BE-APT-008: **JWT Token Generation for Video** | **Priority: HIGH**
GET /join-meeting/:roomId shall generate VideoSDK JWT token containing: participant name (patient or doctor name), room_id, iat, exp (expiration = appointment endTime), permissions (allow_join, allow_mod). Token shall be valid for exact duration of appointment (not longer). Expired tokens shall not allow joining video room.

REQ-BE-APT-009: **Appointment Listing** | **Priority: MEDIUM**
GET /My_Appointments (patients) shall return appointments with status 'booked' or 'ongoing', sorted by date ascending. Shall include: doctor details (name, specialty, profile picture), appointment date/time, meeting_id, and for ongoing appointments, "Join Now" button data. GET /Doctor_Appointments (doctors) shall similarly return appointments with patient details. Past appointments shall not be listed (status 'completed' excluded from default listing).

REQ-BE-APT-010: **Appointment Cancellation** | **Priority: MEDIUM**
Patients shall be able to cancel booked appointments up to 24 hours before appointment time. POST /cancel-appointment/:appointmentId shall validate timing, update appointment status to 'cancelled', update related schedule status back to 'available'. Cancellation within 24 hours shall display warning message.

**Verification Method:** Test schedule creation with various date combinations, verify auto-cancellation, test conflict detection with overlapping appointments, test time window validation, verify VideoSDK room creation.

---

#### Feature BE-3: Chat Message Handling and Session Management

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Chat management handles session creation, message persistence, and integration with AI Service. Efficient session management and context preservation are essential for natural conversation flow. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Start New Chat*
1. Patient sends POST /startNewChat
2. Backend creates new Chat document: { patient_id, messages: [], createdAt, updatedAt }
3. Backend returns chat session ID (MongoDB ObjectId)
4. Frontend stores session ID and uses for subsequent messages in this conversation

*Scenario 2 - Send Message and Get AI Response*
1. Patient sends POST /SendMessage with: sessionId, messageText
2. Backend validates session exists and belongs to authenticated patient
3. Backend creates message object: { sender: 'patient', text: messageText, timestamp: now }
4. Backend appends message to Chat.messages array
5. Backend calls AI Service POST /chat with: message text, session_id, (chat_history for context)
6. AI Service processes message through RAG pipeline and returns response
7. Backend creates AI message object: { sender: 'ai', text: response_text, sources: [...], timestamp: now }
8. Backend appends AI message to Chat.messages array
9. Backend returns AI response to frontend with session maintained

*Scenario 3 - Chat History Retrieval*
1. Patient navigates to symptom checker and session ID remembered
2. Frontend calls GET /getPatientHistory/:sessionId
3. Backend retrieves Chat document with all messages
4. Backend returns message array (last 20 messages) with formatting to display
5. Frontend renders chat history for context preservation

**Functional Requirements:**

REQ-BE-CHAT-001: **Chat Session Creation** | **Priority: HIGH**
POST /startNewChat (authenticated patients) shall create Chat document in MongoDB: { patient_id: authenticated user, messages: [], createdAt: current timestamp, updatedAt: current timestamp }. Shall return session ID (Chat._id) to frontend. Session ID shall be required for all subsequent messages in conversation.

REQ-BE-CHAT-002: **Message Persistence** | **Priority: HIGH**
POST /SendMessage (authenticated patients) shall validate: sessionId provided and valid, sessionId belongs to authenticated patient (security check), messageText non-empty (length > 0) and ≤ 5000 characters. Invalid requests shall return 400 Bad Request. Backend shall append two messages to Chat.messages array: (1) patient message object { sender: 'patient', text, timestamp }, and (2) AI response message { sender: 'ai', text, sources, timestamp }. Both messages shall be persisted in single transaction to MongoDB.

REQ-BE-CHAT-003: **AI Service Integration** | **Priority: HIGH**
Upon receiving message from patient, backend shall call AI Service POST /chat endpoint with: request body { message: messageText, session_id: sessionId, chat_history: last_10_messages_of_conversation }. AI Service shall return response with: { response: response_text, sources: [document IDs], documents: [chunk texts], confidence_score: 0.0-1.0 }. If AI Service unavailable (timeout > 30 seconds), backend shall return 503 Service Unavailable without persisting incomplete message.

REQ-BE-CHAT-004: **Response Formatting** | **Priority: MEDIUM**
AI response received from AI Service shall be stored exactly as returned in Chat.messages.text field. Response shall include medical disclaimers and emergency warnings generated by AI Service. Backend shall not modify response content (formatting applied by frontend).

REQ-BE-CHAT-005: **Chat History Retrieval** | **Priority: MEDIUM**
GET /getPatientHistory/:sessionId (authenticated patients) shall retrieve Chat document where _id = sessionId, validate chat belongs to authenticated patient. Response shall include: all messages in conversation (optionally limited to last 20 for pagination), session metadata (createdAt, updatedAt). Unauthorized access to other users' chats shall return 403 Forbidden.

REQ-BE-CHAT-006: **Session Cleanup** | **Priority: LOW**
Chat sessions shall be retained indefinitely for patient history. Optional: implement archive of very old chats (> 1 year) to separate collection for performance optimization. Chat deletion by patient shall be supported with soft-delete (marking deleted, not permanently removing) for audit trail.

REQ-BE-CHAT-007: **Concurrent Message Handling** | **Priority: MEDIUM**
If patient sends multiple messages rapidly before first message completes processing, backend shall queue messages and process sequentially. Multiple concurrent requests for same session shall not corrupt message order. Implementation: use session-level locking or queue per session.

**Verification Method:** Test chat creation, message sending and persistence, AI Service integration, chat history retrieval, concurrent message handling.

---

#### Feature BE-4: Meeting Notes and Documentation

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Meeting notes generation automates documentation of consultations through audio transcription and summarization. Persistent notes enable continuity of care and professional record-keeping. **Priority: MEDIUM**

**Stimulus/Response Sequences:**

*Scenario 1 - Receive Audio and Generate Notes*
1. Doctor sends POST /notes/process with: appointmentId, audio file (WAV/MP3)
2. Backend validates appointment exists, authenticated user is doctor of that appointment, audio file valid format/size
3. Backend saves audio file to /uploads/audio/ directory with unique filename
4. Backend calls AI Service POST /transcribe with audio file bytes
5. AI Service uses faster-whisper to convert audio to text
6. Backend receives transcript, calls AI Service POST /summarize with: transcript, doctorName, patientName
7. AI Service generates structured summary (findings, recommendations, follow-up items)
8. Backend calls generateNotesPDF() utility to create PDF from summary
9. Backend saves PDF to /uploads/notes/ directory
10. Backend creates MeetingNote document: { appointment_id, doctor_id, patient_id, transcript, summary, pdfPath, createdAt }
11. Backend returns success response with link to download notes PDF

**Functional Requirements:**

REQ-BE-NOTES-001: **Audio File Validation** | **Priority: HIGH**
POST /notes/process shall validate: audio file attached, file size ≤ 50MB, file type in [audio/wav, audio/mpeg, audio/mp4]. Invalid files shall return 400 Bad Request. Audio file shall be saved to /BackEnd/uploads/audio/ with unique filename (timestamp-based) and original extension preserved.

REQ-BE-NOTES-002: **Transcription Service Call** | **Priority: HIGH**
Backend shall send audio file to AI Service POST /transcribe endpoint. Request shall include: audio file (multipart/form-data), model: 'Systran/faster-whisper-small'. AI Service shall return: { transcript: full_text, confidence: 0.0-1.0, utterances: [{text, start_time, end_time, confidence}] }. Timeout: 120 seconds per audio minute. Large audio files may take extended time.

REQ-BE-NOTES-003: **Summarization Service Call** | **Priority: HIGH**
Backend shall call AI Service POST /summarize with request body: { transcript, doctor_name, patient_name }. AI Service shall return structured summary: { summary: summary_text, key_findings: [...], recommendations: [...], follow_up_required: true/false, follow_up_items: [...] }. Response shall be markdown-formatted for PDF generation.

REQ-BE-NOTES-004: **PDF Generation** | **Priority: HIGH**
Backend shall use pdfkit library (generateNotesPDF utility) to generate professional PDF document from summary data. PDF shall include: header with clinic name/logo, patient name, doctor name, appointment date/time, body with summary content formatted with sections, footer with generation date. PDF shall be saved to /BackEnd/uploads/notes/ with unique filename.

REQ-BE-NOTES-005: **Meeting Notes Persistence** | **Priority: HIGH**
Backend shall create MeetingNote document: { appointment_id: ObjectId (ref to Appointment), doctor_id: ObjectId, patient_id: ObjectId, transcript: full_transcript_text, summary: markdown_summary, pdfPath: /uploads/notes/filename.pdf, createdAt: timestamp }. Document shall be indexed by appointment_id for quick retrieval.

REQ-BE-NOTES-006: **Notes Retrieval** | **Priority: MEDIUM**
GET /notes/:appointmentId shall retrieve MeetingNote where appointment_id = appointmentId. Response shall include transcript, summary, and link to download PDF. Only doctor of the appointment and the patient shall be able to retrieve notes (authorization check).

REQ-BE-NOTES-007: **PDF Download** | **Priority: MEDIUM**
GET /notes/:appointmentId/download shall serve PDF file from /uploads/notes/ directory. Response shall include Content-Type: application/pdf and Content-Disposition: attachment for browser download. File name shall be readable (e.g., "Consultation_Notes_[PatientName]_[Date].pdf").

**Verification Method:** Test audio file upload, transcription accuracy, summarization quality, PDF generation, notes retrieval and download.

---

### 2.7.3 AI Service Features

**[Font: Times New Roman, Size 11, Bold, Italicize]**

#### Feature AI-1: Retrieval-Augmented Generation (RAG) Pipeline

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
The RAG pipeline is the core intellectual engine of MediCare, providing evidence-based medical guidance through retrieval of authoritative medical knowledge and generation of contextually appropriate responses. The system must be accurate, responsive, and grounded in verified medical literature. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 - Process User Query Through RAG*
1. Backend sends POST /chat to AI Service with: { message: symptom description, session_id, chat_history: last 10 messages }
2. AI Service receives message: "I have been having headaches for 3 days with fever"
3. RAG pipeline processes:
   - **History-Aware Retriever**: Uses chat history to make query standalone: "Describe your symptoms when you have been having headaches for 3 days with fever"
   - **Vector Search**: Converts query to embeddings using sentence-transformers, searches FAISS index, retrieves k=3 most relevant medical document chunks
   - **Prompt Construction**: Combines retrieved documents with system prompt and query into LLM input
   - **Response Generation**: Groq LLaMA 3.1 8B generates response using temperature=0.3 for controlled output
   - **Safety Filtering**: Checks for emergency symptoms (chest pain, difficulty breathing, etc.)
   - **Response Formatting**: Structures response with standardized sections
4. AI Service returns: { response, sources: [doc_ids], documents: [chunk_texts], emergency_detected: boolean }
5. Backend forwards response to Frontend
6. Frontend displays response with medical disclaimer and emergency warning if applicable

*Scenario 2 - Emergency Symptom Detection*
1. User message: "I have severe chest pain and difficulty breathing"
2. RAG pipeline processes message and detects emergency keywords
3. Response includes emergency warning: "🚨 EMERGENCY: If experiencing chest pain and difficulty breathing, call emergency services immediately"
4. Response is still generated but with prominent emergency directive

**Functional Requirements:**

REQ-AI-RAG-001: **FAISS Vector Store Initialization** | **Priority: HIGH**
AI Service shall initialize FAISS vector store on startup by loading pre-built index from /AI/vectorstore/db_faiss/. Index shall contain embeddings for medical knowledge base: Harrison's Manual, Hutchison's Clinical Methods, Nelson's Essentials of Pediatrics, Robbins Pathology, Gale Encyclopedia. Index shall support similarity search. Index dimension: 384 (sentence-transformers/all-MiniLM-L6-v2 output dimension).

REQ-AI-RAG-002: **Query Embedding and Retrieval** | **Priority: HIGH**
Upon receiving message, AI Service shall: (1) convert message to embeddings using sentence-transformers/all-MiniLM-L6-v2 model, (2) perform FAISS similarity search with k=3 to retrieve most relevant document chunks, (3) return chunks with similarity scores (0.0-1.0). Retrieved chunks shall have minimum similarity score ≥ 0.4 to be considered relevant.

REQ-AI-RAG-003: **History-Aware Query Processing** | **Priority: MEDIUM**
RAG pipeline shall use last 10 messages of conversation history (if available) to contextualize current query. Using LLM, rephrase current message to be standalone using context: original query + history → standalone query. Example: history shows "I have headache for 3 days", current message "with fever" → rephrased: "I have had headache for 3 days with fever". This enables single-turn response generation without maintaining conversation state in vector search.

REQ-AI-RAG-004: **LLM Response Generation** | **Priority: HIGH**
AI Service shall use Groq LLaMA 3.1 8B model with configuration: temperature=0.3 (low randomness for consistent output), max_tokens=1000, system_prompt enforcing medical disclaimer and safety. System prompt shall specify: generate response as medical professional speaking to patient in plain language, include disclaimer, structure response with standard sections, detect emergency symptoms and warn appropriately. Request to Groq API shall include API key authentication.

REQ-AI-RAG-005: **Response Structure Enforcement** | **Priority: HIGH**
Response shall be formatted with standardized sections: 📋 Understanding Your Symptoms (rephrase), 🔍 Possible Conditions (list conditions with likelihood), 💊 General Treatment (general approaches), 💉 Medications (medication categories), 🏥 Precautionary Measures (prevention), 👨‍⚕️ When to Seek Care (red flags), ⚕️ Next Steps (professional consultation recommendation). Each section formatted as markdown with proper headings and bullet points.

REQ-AI-RAG-006: **Emergency Symptom Detection** | **Priority: HIGH**
Response generation shall include emergency symptom detection: scan response text for emergency keywords (chest pain, difficulty breathing, severe bleeding, loss of consciousness, severe allergic reaction, etc.). If emergency symptoms detected in user message or response, prepend response with warning: "🚨 EMERGENCY SYMPTOMS: [symptoms]. Call [emergency_number] immediately." Emergency warnings shall not be dismissible.

REQ-AI-RAG-007: **Medical Disclaimer** | **Priority: HIGH**
All responses shall include non-removable medical disclaimer: "⚠️ This AI assessment is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for diagnosis and treatment."

REQ-AI-RAG-008: **Source Attribution** | **Priority: MEDIUM**
Response shall include sources: list document IDs and titles of retrieved medical chunks. Response object shall return: { response_text, sources: [source_ids], documents: [chunk_texts], confidence_score }. Frontend may display sources as clickable references (optional).

REQ-AI-RAG-009: **Response Time** | **Priority: HIGH**
RAG pipeline shall complete within 3000ms ± 1000ms from request receipt to response return (3-5 seconds typical). Time includes: embedding conversion (100-200ms), FAISS search (50-100ms), LLM inference (2000-3500ms), response processing (200-300ms). Timeout: 30 seconds maximum before returning error to backend.

REQ-AI-RAG-010: **Hallucination Prevention** | **Priority: HIGH**
System shall constrain response generation to only content retrieved from FAISS index. LLM shall not generate medical information outside retrieved context. If query matches no documents with confidence ≥ 0.4, system shall return: "I don't have sufficient information about your symptoms in my medical knowledge base. Please consult a healthcare professional." This prevents hallucinated diagnoses.

**Verification Method:** Test RAG pipeline with various symptom descriptions, verify emergency detection, measure response times, verify hallucination prevention with out-of-domain queries.

---

#### Feature AI-2: Audio Transcription

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Audio transcription converts consultation recordings to text for documentation and summarization. Accurate transcription is essential for generating reliable meeting notes. **Priority: MEDIUM**

**Stimulus/Response Sequences:**

*Scenario 1 - Transcribe Consultation Audio*
1. Backend sends POST /transcribe with: audio file (WAV/MP3 format), model: 'Systran/faster-whisper-small'
2. AI Service loads faster-whisper model from /AI/models/ (downloaded on first use, cached for subsequent requests)
3. AI Service processes audio through whisper model: converts audio frames to mel spectrograms, runs speech recognition
4. AI Service returns: { transcript: full_text, confidence: 0.92, utterances: [{text: "...", start: 10.5, end: 15.2, confidence: 0.94}] }
5. Backend receives transcript and proceeds to summarization

**Functional Requirements:**

REQ-AI-TRANS-001: **Audio Format Support** | **Priority: HIGH**
POST /transcribe shall accept audio files in formats: WAV, MP3, OGG, FLAC, M4A. File size limit: 50MB. Audio shall be processed directly without conversion. API response shall include detailed timestamp information for each utterance: start_time (seconds), end_time (seconds), and confidence score (0.0-1.0) per utterance.

REQ-AI-TRANS-002: **Model Configuration** | **Priority: HIGH**
AI Service shall use faster-whisper model variant 'Systran/faster-whisper-small' for speed/accuracy balance. Model shall be downloaded and cached in /AI/models/ directory on first use. Model shall be configured with language: 'en' (English) for transcription. Temperature: 0.0 for reproducible results.

REQ-AI-TRANS-003: **Transcription Accuracy** | **Priority: MEDIUM**
Transcription accuracy target: ≥ 90% word accuracy on medical terminology and consultation content (medical terms, patient names, prescribed treatments). Accuracy measured against manual transcription gold standard. Faster-whisper small model provides ~85-95% accuracy depending on audio quality and accents.

REQ-AI-TRANS-004: **Timeout Handling** | **Priority: MEDIUM**
Audio transcription timeout: 120 seconds for 1 hour of audio (reasonable upper bound for typical consultation). If transcription exceeds timeout, return 504 Gateway Timeout with message "Audio transcription taking longer than expected. Please try again later."

REQ-AI-TRANS-005: **Confidence Scoring** | **Priority: MEDIUM**
Response shall include confidence score (0.0-1.0) for overall transcription and per-utterance confidence. Confidence < 0.7 should be flagged in response for human review by doctor before finalizing notes.

**Verification Method:** Test transcription with various audio formats, measure accuracy on sample consultation recordings, test timeout behavior with long audio.

---

#### Feature AI-3: Consultation Summarization

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Consultation summarization generates structured, patient-friendly summaries from meeting transcripts. Summaries enable efficient note-taking and provide clear documentation of consultation outcomes. **Priority: MEDIUM**

**Stimulus/Response Sequences:**

*Scenario 1 - Summarize Consultation Transcript*
1. Backend sends POST /summarize with: { transcript, doctor_name: "Dr. Ahmed", patient_name: "Fatima" }
2. AI Service uses LLM to analyze transcript and generate summary
3. Response structure: { summary: summary_text, key_findings: [...], recommendations: [...], follow_up_required: true, follow_up_items: [...] }
4. Summary formatted as markdown for PDF generation
5. Backend receives summary and proceeds to PDF generation

**Functional Requirements:**

REQ-AI-SUM-001: **Summarization Parameters** | **Priority: HIGH**
POST /summarize shall accept request with: transcript (text of meeting), doctor_name, patient_name. Response shall include structured summary with sections: (1) Consultation Summary (2-3 paragraphs overview), (2) Key Findings (bullet list of medical findings), (3) Recommendations (treatment recommendations), (4) Follow-up Required (boolean), (5) Follow-up Items (specific actions for patient). Summary shall be in markdown format suitable for PDF rendering.

REQ-AI-SUM-002: **Response Formatting** | **Priority: HIGH**
Summary shall be formatted for patients (plain language, avoid jargon) and organized logically. Length: 300-500 words typical for consultation summaries. Summary shall include medication names if prescribed (but not specific dosages or dispensing instructions—those responsibility of doctor to record separately).

REQ-AI-SUM-003: **Contextual Awareness** | **Priority: MEDIUM**
Summarization shall include patient and doctor names in summary context ("As discussed with Dr. [doctor_name], [summary]..."). Summary language shall be professional but accessible to patient with varying health literacy.

REQ-AI-SUM-004: **Accuracy and Relevance** | **Priority: HIGH**
Summarization shall extract actual discussion points from transcript and not hallucinate information. Summary shall be verifiable against transcript. Doctor shall review summary before finalizing notes (manual review step not implemented in v1.0 but UI supports flagging for review).

REQ-AI-SUM-005: **Summarization Time** | **Priority: MEDIUM**
Summarization shall complete within 10 seconds for typical 10-minute consultation transcript (1500-2000 words). Timeout: 30 seconds maximum.

**Verification Method:** Test summarization with various transcript lengths and medical specialties, verify accuracy against manual reviews, test timeout handling.

---

## 2.8 Nonfunctional Requirements

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.8.1 Performance Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-PERF-001: API Response Time** | **Priority: HIGH**
REST API endpoints shall respond within specified time ranges:
- Authentication endpoints (login, registration): 500ms ± 200ms
- Doctor search/listing endpoints: 300ms ± 150ms
- Appointment booking endpoints: 800ms ± 300ms
- Chat AI endpoints: 3000ms ± 1000ms (includes AI inference)
- Video token generation: 200ms ± 100ms

Measurements taken under normal load (< 50 concurrent users). Response times include full round-trip from request submission to response display in browser.

**REQ-PERF-002: Database Query Performance** | **Priority: HIGH**
MongoDB queries shall execute within:
- Simple queries (user lookup by ID): 50-100ms
- Indexed queries (appointment listing): 100-200ms
- Complex aggregations (doctor availability): 300-500ms

All frequently accessed collections (patients, doctors, appointments) shall have indexes on common filter fields (email, doctor_id, patient_id, appointment status).

**REQ-PERF-003: Concurrent User Capacity** | **Priority: MEDIUM**
System shall support minimum 100 concurrent users with acceptable performance (response times within stated ranges). System architecture shall not degrade gracefully below this threshold. Scaling beyond 100 users addressed in future phases through horizontal scaling of services.

**REQ-PERF-004: Page Load Time** | **Priority: HIGH**
Frontend pages shall load and display initial content (First Contentful Paint) within 2000ms ± 500ms on broadband connections (10+ Mbps) and within 5000ms ± 1000ms on mobile connections (4G, ~5 Mbps). Time measured from navigation initiation to initial UI elements visible and interactive.

**REQ-PERF-005: AI Inference Latency** | **Priority: HIGH**
Groq LLaMA 3.1 8B model inference shall complete within 2000ms ± 1000ms per query (accounting for Groq API network roundtrip time). Total RAG pipeline (embedding + retrieval + inference + formatting): 3000ms ± 1000ms.

**REQ-PERF-006: Transcription Throughput** | **Priority: MEDIUM**
Audio transcription shall process at minimum 10:1 ratio (10 minutes of audio transcribed in 1 minute of processing). For 30-minute consultation: transcription shall complete within 3-5 minutes. For 10-minute consultation: within 60-90 seconds.

**REQ-PERF-007: Database Connection Pool** | **Priority: MEDIUM**
Backend shall maintain connection pool to MongoDB with minimum 5 connections in development, 20-50 in production. Connection pool shall reuse connections to minimize overhead. No individual request shall wait > 100ms to acquire database connection.

**REQ-PERF-008: Cache Strategy** | **Priority: LOW**
Doctor listings and specialty lists shall be cached in-memory in Backend for 1-hour TTL to reduce database hits. Cache invalidation occurs on manual refresh or 1-hour expiration. Chat history shall not be cached (always fetch fresh from database).

### 2.8.2 Scalability and Availability

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-AVAIL-001: System Uptime** | **Priority: HIGH**
System shall achieve 99.5% uptime target (maximum 3.6 hours downtime per month). Planned maintenance windows (monthly updates) not counted toward downtime calculation. Measured over 30-day rolling window.

**REQ-AVAIL-002: Graceful Degradation** | **Priority: MEDIUM**
If AI Service becomes unavailable, Backend shall return user-friendly message "AI Service temporarily unavailable. Please try again later or consult a healthcare professional." Chat functionality shall be disabled but appointment booking/video consultation shall continue operating. System shall not cascade failures from AI Service to other components.

**REQ-AVAIL-003: Database Failover** | **Priority: MEDIUM**
MongoDB deployment shall include replica set configuration for automatic failover (not implemented in v1.0 development, required for production). Automatic failover to secondary replica shall occur within 30 seconds of primary failure.

**REQ-AVAIL-004: Error Recovery** | **Priority: HIGH**
Backend shall implement exponential backoff retry logic for external API calls (Groq, VideoSDK): retry 1 (1 second delay), retry 2 (2 seconds), retry 3 (4 seconds), maximum 3 retries. After 3 failures, return error to user rather than retrying indefinitely.

**REQ-AVAIL-005: Session Persistence** | **Priority: HIGH**
User sessions stored in httpOnly cookies shall persist across browser restarts (6-hour expiration). Session data (user ID, authentication token) shall be stored server-side in MongoDB, not client-side, to prevent tampering.

### 2.8.3 Security Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-SEC-001: Authentication** | **Priority: HIGH**
All protected resources shall require authentication via JWT tokens in httpOnly cookies. No authentication information shall be accessible to JavaScript (httpOnly flag prevents access). Tokens shall include expiration (6 hours) and be verified on each protected request.

**REQ-SEC-002: Authorization** | **Priority: HIGH**
Backend shall enforce authorization checks: patients can only access their own appointments, chat history, profile. Doctors can only view/modify their own schedule, appointments, notes. No cross-user data access shall be possible. Violations shall return 403 Forbidden.

**REQ-SEC-003: Password Security** | **Priority: HIGH**
All passwords shall be hashed using bcrypt with salt rounds ≥ 10 before database storage. Password comparison shall use bcrypt.compare() for timing-attack resistance. Plaintext passwords shall never appear in logs, error messages, or memory after use.

**REQ-SEC-004: Data Encryption in Transit** | **Priority: HIGH**
All communication between Frontend-Backend and Backend-AI shall use HTTPS/TLS 1.2+. Self-signed certificates acceptable in development. Production deployments shall use CA-signed certificates with valid domain names. No HTTP (unencrypted) connections to backend shall be accepted in production.

**REQ-SEC-005: CSRF Protection** | **Priority: HIGH**
Backend shall implement CSRF protection: SameSite=Strict cookie attribute prevents CSRF attacks. For state-changing operations (POST, PUT, DELETE), browser's same-origin policy enforces additional protection. CSRF tokens not required given strict SameSite configuration.

**REQ-SEC-006: XSS Prevention** | **Priority: HIGH**
Frontend shall sanitize all user input before rendering to prevent XSS attacks. React's built-in JSX escaping provides default XSS protection. File uploads shall be validated server-side (file type, size) and stored outside web root. Profile pictures served statically without execution permissions.

**REQ-SEC-007: SQL/NoSQL Injection Prevention** | **Priority: HIGH**
Backend shall use Mongoose ODM for all database queries (parameterized queries). No string concatenation of queries. All user inputs validated before database queries. Mongoose schema validation enforces data types.

**REQ-SEC-008: API Rate Limiting** | **Priority: MEDIUM**
API endpoints shall implement rate limiting: 100 requests per minute per IP address for public endpoints (login, registration), 1000 requests per minute per authenticated user for authenticated endpoints. Excessive requests return 429 Too Many Requests.

**REQ-SEC-009: Input Validation** | **Priority: HIGH**
All user inputs (forms, API parameters) shall be validated on backend: type checking, length limits, format validation (email, phone, date), whitelist of allowed values for select inputs. Invalid inputs return 400 Bad Request with specific validation errors.

**REQ-SEC-010: File Upload Security** | **Priority: HIGH**
File uploads (profile pictures) shall: (1) validate file type (JPG/PNG only), (2) validate file size (≤ 5MB), (3) scan file headers to verify actual file type matches extension, (4) rename files with unique identifiers to prevent directory traversal, (5) store outside web-accessible directory, (6) serve through authenticated endpoint with access control checks.

**REQ-SEC-011: Audit Logging** | **Priority: MEDIUM**
Backend shall log all authentication attempts (successful and failed) with timestamp and user email. Log sensitive operations: appointment cancellation, profile updates, access to medical information. Logs shall be stored securely and not include passwords or tokens.

**REQ-SEC-012: Data Privacy** | **Priority: HIGH**
Patient health information (symptom descriptions, consultation notes, medical history) shall be treated as personally identifiable sensitive information (PII). Access shall be restricted to authenticated users authorized for that data. Deletion requests shall be supported (GDPR/PDPA compliance readiness).

**REQ-SEC-013: API Key Management** | **Priority: HIGH**
External API keys (Groq API, VideoSDK API key/secret) shall be stored in environment variables (.env file) and never committed to version control. Environment variables shall be loaded securely at server startup. API keys shall not appear in logs or error messages.

### 2.8.4 Usability Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-USAB-001: Accessibility** | **Priority: MEDIUM**
System shall meet WCAG 2.1 Level AA standards: color contrast ≥ 4.5:1 for text, keyboard navigation support, descriptive alt text for images, form labels for all inputs, semantic HTML for screen reader compatibility. Users with visual impairments shall be able to use the system with screen reader software.

**REQ-USAB-002: Mobile Responsiveness** | **Priority: HIGH**
All interfaces shall be fully functional on mobile devices (portrait and landscape orientations). Touch targets minimum 44px × 44px. Text shall be readable without horizontal scrolling. Mobile interfaces shall use vertical layouts (single column) while desktop uses multi-column layouts efficiently.

**REQ-USAB-003: Language and Localization** | **Priority: LOW**
v1.0 released in English. Future versions shall support Urdu and other South Asian languages. Infrastructure (i18n translation keys) shall be in place but not implemented.

**REQ-USAB-004: User Guidance** | **Priority: MEDIUM**
System shall provide contextual help: tooltips on form fields, example symptom descriptions for symptom checker, progress indicators during appointment booking (e.g., "Step 2 of 3: Confirm Details"). Help documentation shall be accessible but not obtrusive.

**REQ-USAB-005: Error Messages** | **Priority: HIGH**
Error messages shall be clear, specific, and actionable. Messages shall indicate what went wrong and suggest corrective action. Examples: "Email already registered. Try logging in or use different email" instead of "User error." Messages shall be displayed in user-friendly language.

**REQ-USAB-006: Confirmation Dialogs** | **Priority: MEDIUM**
Actions with consequences (appointment cancellation, account deletion) shall require confirmation dialog. Confirmation shall display specific details of action being performed. Cancel button should be easily accessible.

### 2.8.5 Compatibility and Platform Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-COMPAT-001: Browser Compatibility** | **Priority: HIGH**
System shall support: Chrome/Chromium 90+, Firefox 88+, Safari 14+, Edge 90+. Mobile browsers: Chrome Android 90+, Safari iOS 14+. JavaScript ES2020+ features supported. Graceful degradation for older browsers (core functionality available, advanced features disabled).

**REQ-COMPAT-002: Operating System** | **Priority: MEDIUM**
System shall function on Windows 7+, macOS 10.12+, Linux (Ubuntu 18.04+). No platform-specific features in web application (all standards-based HTML/CSS/JavaScript).

**REQ-COMPAT-003: Network Compatibility** | **Priority: HIGH**
System shall function on network connections ranging from 2 Mbps (low bandwidth) to 100+ Mbps (broadband). Connection degradation shall be graceful: high-bandwidth users experience video consultation at high quality, low-bandwidth users experience at reduced quality but with maintained audio. Video shall auto-adjust quality based on available bandwidth.

**REQ-COMPAT-004: Device Compatibility** | **Priority: MEDIUM**
System shall function on various device hardware: older smartphones (2GB RAM) to modern devices (8GB+ RAM), tablets, laptops, desktops. No high-end GPU or CPU required for functionality. Video processing may be limited on low-end devices.

---

## 2.9 Business Rules

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

**BR-001: Patient Account Requirements**
Patients may create multiple accounts but each email address may have only one active account. Patient accounts require valid email address and strong password. Patients may update their profile information at any time.

**BR-002: Doctor Account Requirements**
Doctor accounts require verification of professional credentials before becoming visible to patients (not implemented v1.0; credential verification placeholder). Each doctor can have only one active account per email. Doctor profile picture is mandatory for account activation.

**BR-003: Appointment Scheduling Rules**
Doctors may create availability slots up to 30 days in advance. Each slot has 15-minute minimum duration and 120-minute maximum duration. Slots automatically canceled if date has passed or if slot end time has passed. Patients may book appointments 24 hours to 30 days in advance. Patients cannot book overlapping appointments on same date.

**BR-004: Appointment Cancellation Policy**
Patients may cancel appointments up to 24 hours before appointment time without penalty. Cancellation within 24 hours may require doctor consent (not enforced v1.0; courtesy notice only). Doctors may cancel appointments anytime with notification to patient.

**BR-005: Consultation Duration and Fees**
Each appointment has fixed duration (15-120 minutes) and fixed fee set by doctor. Doctor cannot change fee retroactively for booked appointments. Refund policy for no-shows determined by doctor's cancellation policy (not enforced v1.0).

**BR-006: AI Symptom Checker Usage**
AI symptom checker available to authenticated patients only. One AI session created per "Start New Chat" action. Chat history maintained across sessions. Patients may have unlimited concurrent chat sessions. AI responses include mandatory medical disclaimer and emergency detection.

**BR-007: Video Consultation Access**
Video consultation available only within 5-minute buffer before start time to 5-minute buffer after end time. Joining before time window prevents access with message "Appointment not started yet." Joining after time window prevents access with message "Appointment has ended." Only doctor and patient of specific appointment can access that consultation room (VideoSDK room access control).

**BR-008: Data Retention and Privacy**
All patient data retained indefinitely unless patient requests deletion (GDPR/PDPA compliance readiness). Meeting notes retained for minimum 5 years for medical record purposes. Deleted accounts have PII redacted but transaction records maintained for audit trail. Chat history retained indefinitely as part of patient medical record.

**BR-009: Professional Conduct Standards**
Doctors shall not share patient information with third parties without consent. Doctors shall maintain confidentiality of patient health information. Platform shall not be used for purposes other than legitimate telemedicine consultations.

**BR-010: Availability and Service Level**
System operates 24/7 with 99.5% target uptime. Scheduled maintenance windows may occur monthly (announced in advance). AI Service unavailability does not suspend appointment booking or video consultation (graceful degradation).

**BR-011: Prescription Business Rules**
A doctor may only issue one prescription per completed appointment (one-to-one enforcement via unique index on appointment_id). Prescriptions may only be created for appointments with status = 'completed'. Once issued, a prescription cannot be deleted — it constitutes a permanent clinical record. Patients may view their prescriptions but cannot edit them. Doctors may view all prescriptions they have issued but cannot view prescriptions issued by other doctors.

---

## 2.7.4 Prescription Management Feature

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

#### Feature BE-PRESC: Digital Prescription Management

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**Description and Priority:**
Prescription management enables doctors to issue structured digital prescriptions for patients upon completion of a consultation. The prescription is linked uniquely to the appointment, contains clinical details (diagnosis, medicines with dosage/frequency/duration/instructions, vital signs, lifestyle advice, follow-up date), is persisted in MongoDB, and triggers an in-app notification to the patient. Patients can view their prescriptions through the patient portal. **Priority: HIGH**

**Stimulus/Response Sequences:**

*Scenario 1 — Doctor Issues Prescription*
1. Doctor navigates to completed appointments list
2. Doctor clicks "Write Prescription" on a completed appointment card
3. System displays prescription form pre-populated with patient and doctor names
4. Doctor fills: Diagnosis (text), Medicine entries (name, dosage, frequency, duration, special instructions), Vital signs (blood pressure, temperature, pulse, weight), Advice (lifestyle/dietary), Follow-up date (optional date picker)
5. Doctor clicks "Submit Prescription"
6. System creates Prescription document in MongoDB
7. System creates Notification for patient ("Your prescription is ready")
8. Doctor sees confirmation: "Prescription issued successfully"

*Scenario 2 — Doctor Views Previously Issued Prescriptions*
1. Doctor navigates to a completed appointment
2. System shows "View Prescription" button if prescription exists for that appointment
3. Doctor clicks "View Prescription"
4. System retrieves and displays the prescription in read-only format

*Scenario 3 — Patient Views Prescription*
1. Patient navigates to completed appointments list
2. Patient sees "View Prescription" button on appointments that have a linked prescription
3. Patient clicks "View Prescription"
4. System verifies patient owns this appointment
5. System displays prescription: diagnosis, complete medicines list, vital signs recorded, advice, follow-up date

**Functional Requirements:**

**REQ-BE-PRESC-001: Prescription Creation** | **Priority: HIGH**
The backend shall expose POST /prescriptions/:appointmentId endpoint. Endpoint shall require doctor authentication. System shall validate: (a) appointment exists, (b) requesting doctor is the assigned doctor for that appointment, (c) appointment status = 'completed', (d) no prescription already exists for this appointment. On success, system creates Prescription document and returns 201 Created.

**REQ-BE-PRESC-002: Prescription Idempotency** | **Priority: HIGH**
Only one prescription shall be allowed per appointment. Unique index on Prescription.appointment_id shall enforce this at database level. If doctor submits a second prescription for the same appointment, backend shall return 409 Conflict: "Prescription already issued for this appointment."

**REQ-BE-PRESC-003: Prescription Schema** | **Priority: HIGH**
The Prescription document shall store: appointment_id (ObjectID, unique FK), doctor_id (ObjectID, FK), patient_id (ObjectID, FK), diagnosis (String, required), medicines (Array: [{name, dosage, frequency, duration, instructions}]), vital_signs ({blood_pressure, temperature, pulse, weight}), advice (String), follow_up_date (Date, optional), createdAt, updatedAt.

**REQ-BE-PRESC-004: Doctor — Retrieve Prescription** | **Priority: HIGH**
The backend shall expose GET /prescriptions/appointment/:appointmentId for the assigned doctor to retrieve their issued prescription. If no prescription exists, system returns 404. If doctor is not the assigned doctor, system returns 403.

**REQ-BE-PRESC-005: Patient — Retrieve Prescription** | **Priority: HIGH**
The backend shall expose GET /prescriptions/my/:appointmentId for the patient to retrieve their prescription. System shall verify: (a) patient is authenticated, (b) patient_id on the prescription matches requesting patient. If not authorized, return 403.

**REQ-FE-PRESC-001: Doctor Prescription Form** | **Priority: HIGH**
The doctor portal shall display a prescription creation form on completed appointment cards. Form shall include: Diagnosis field (required, textarea), dynamic medicines table (minimum 1 row, add/remove rows), vital signs fields, advice textarea, and follow-up date picker. Form shall validate that at least one medicine entry has name and dosage before allowing submission.

**REQ-FE-PRESC-002: Patient Prescription View** | **Priority: HIGH**
The patient portal shall show a "View Prescription" button on completed appointment cards when a prescription exists. Prescription display page shall show: doctor name, consultation date, diagnosis, medicines list formatted as a prescription (name | dosage | frequency | duration | instructions), vital signs table, advice section, follow-up date. Display shall be print-friendly.

**REQ-FE-PRESC-003: Prescription Notification** | **Priority: MEDIUM**
On prescription creation, the system shall trigger a backend Notification to the patient with type = 'prescription_issued'. Patient dashboard notification badge shall update within the next polling cycle (≤ 30 seconds). Notification message: "Dr. [LastName] has issued your prescription for appointment on [date]."

**Verification Method:** Integration test: doctor creates prescription → patient retrieves it; attempt duplicate → 409; non-assigned doctor attempt → 403; patient without appointment → 403.

---

## 2.10 Other Requirements

**[Font: Times New Roman, Size 11, Bold]**

**[Font: Times New Roman, Size 12, 1.5 Line Spacing, Justified]**

### 2.10.1 Database Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-DB-001: Database Selection**
MongoDB shall be used as primary database for flexibility in schema design and scalability. MongoDB version 7.0.0 minimum. Single-node MongoDB instance acceptable for v1.0; replica set recommended for production.

**REQ-DB-002: Schema Design**
Database shall include collections: patients, doctors, schedules, appointments, chats, meetingNotes, reviews. See project documentation for complete schema specifications including field types and relationships.

**REQ-DB-003: Indexing Strategy**
Indexes created on: (doctors.email), (patients.email), (appointments.patient_id), (appointments.doctor_id), (appointments.status), (schedules.doctor_id), (schedules.date), (chats.patient_id). These indexes optimize common queries and prevent N+1 query problems.

**REQ-DB-004: Backup and Recovery**
Daily automated backups of MongoDB database. Backup retention: minimum 30 days. Recovery from backup tested monthly. Backup procedure not implemented in v1.0 (development only); required for production.

### 2.10.2 Development and Testing Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-DEV-001: Development Environment Setup**
Development environment setup documented in project README. Required software: Node.js 18+, Python 3.9+, MongoDB 7.0+. Backend server runs on localhost:4000, AI service on localhost:8000, Frontend on localhost:5173.

**REQ-DEV-002: Unit Testing**
Backend and AI Service shall have minimum 70% code coverage with unit tests. Frontend shall have minimum 50% coverage. Testing framework: Jest (Backend/Frontend), pytest (AI Service).

**REQ-DEV-003: Integration Testing**
System integration tests verify end-to-end flows: patient registration → symptom check → doctor search → appointment booking → video consultation. Tests shall cover both success and failure scenarios.

**REQ-DEV-004: Code Review Process**
All code changes shall undergo review before merging to main branch. Reviewers verify: requirements compliance, code quality, security, performance, test coverage.

### 2.10.3 Regulatory and Compliance Requirements

**[Font: Times New Roman, Size 11, Bold, Italicize]**

**REQ-COMP-001: Medical Liability and Disclaimers**
All AI-generated responses include medical disclaimer: "This assessment is for informational purposes only and does not replace professional medical evaluation." Liability disclaimers displayed prominently. Users must acknowledge understanding before system use.

**REQ-COMP-002: Data Protection Compliance**
System shall be designed to support GDPR and PDPA (Pakistan Data Protection Act) compliance: data minimization, user consent for data use, right to deletion, data portability. Not all features implemented in v1.0 but architecture supports future compliance features.

**REQ-COMP-003: Healthcare Regulations**
System operates as telemedicine enabler, not as primary care provider. Professional medical judgment remains responsibility of doctor, not AI system. No automated diagnosis or treatment without doctor review.

**REQ-COMP-004: Informed Consent**
Users explicitly acknowledge understanding that AI assessment is preliminary and requires professional confirmation. Video consultations recorded with participant consent (not implemented v1.0; placeholder for future).

---

## Summary

This comprehensive Software Requirement Specifications document details all functional and nonfunctional requirements for the MediCare AI platform. Requirements are organized by technology layer (Frontend, Backend, AI Service), with 60+ unique, measurable, and verifiable requirements covering user interfaces, external interfaces, system features, performance, security, usability, and business rules. Each requirement includes priority level (HIGH/MEDIUM/LOW), acceptance criteria, and verification methods. This SRS serves as the primary specification document guiding development, testing, and stakeholder validation throughout the project lifecycle.

---

**[Font: Times New Roman, Size 11, 1.5 Line Spacing]**

## References

IEEE 830-1998: IEEE Guide to Software Requirements Specifications

---

**End of Chapter 2**

**[Total Word Count: Approximately 7,200 words]**
**[Formatting: Times New Roman, 12pt, 1.5 Line Spacing, Justified]**
**[60+ Requirements with unique identifiers]**
**[All sections properly numbered]**
