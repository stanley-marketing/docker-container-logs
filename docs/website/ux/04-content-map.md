# Website Content Map

This document maps content from the original `README.md` to the new website architecture defined in `01-architecture.md`.

## 📍 Homepage (`/`)

### **Hero Section**
- **Headline:** `<h1>Transform Log Chaos into Clarity</h1>` (from README title)
- **Sub-headline:** `<p>AI-powered summaries for your Docker logs, log files, and remote logs in real-time.</p>` (from README subtitle)
- **Live Demo:** `[Live Demo: Log lines transforming into summary]` (visual representation of the "Solution" section)

### **Problem/Solution Section**
- **Content:** The entire "The Problem Every Developer Faces" and "The Solution: AI-Powered Log Intelligence" sections from the README. This is the core "Aha!" moment.

### **Role-Based Paths Section**
- **Content:** This is a **new content block** that serves as the primary navigation hub.
- **Links to:** `/developer`, `/devops`, `/manager`

### **Features Overview Section**
- **Content:** The "Why Developers Love This Tool" section, repurposed as a high-level feature list.
- **Sub-sections:**
    - "30x Faster Incident Response"
    - "AI-Powered Insights"
    - "Multiple Log Sources"
    - "Interactive Q&A"
    - "Built for Production"

### **Social Proof/Credibility Section**
- **Content:** This is a **new content block** using data from the README.
- **Metrics:** "142K lines/sec" (from "Built for Production")
- **Testimonials:** (Placeholder for future user quotes)

---

## 📍 Developer Path (`/developer`)

### **🟢 EASY: 5-Minute Quick Start**
- **Content:** The entire "Quick Start (2 minutes)" section from the README.
- **Sections:**
    1. Install (`git clone`, `npm install`)
    2. Set up Gemini API (`export GEMINI_API_KEY`)
    3. Start Summarising (Docker, Files, URLs examples)
    4. Query Your Summaries (API and CLI examples)

### **🟡 STANDARD: Production Deployment**
- **Content:** The "Configuration & Deployment" section from the README.
- **Sections:**
    - Environment Variables
    - Docker Deployment
    - Kubernetes with Helm

### **🔴 ADVANCED: API & Customization**
- **Content:** The "Performance & Monitoring" and "Testing" sections.
- **Sections:**
    - Benchmarked Performance
    - Prometheus Metrics
    - Observability (Structured Logs)
    - Running Tests

---

## 📍 DevOps Path (`/devops`) - (Content Gaps Identified)

### **🟢 EASY: Monitor One Container**
- **Content:** Reuses the "Start Summarising" (Docker) part of the Quick Start.

### **🟡 STANDARD: Kubernetes & Monitoring**
- **Content:** Reuses "Kubernetes with Helm" and "Prometheus Metrics" sections.

### **🔴 ADVANCED: Scaling & Security**
- **Content Gaps:**
    - **[NEW]** Detailed guide on scaling the service.
    - **[NEW]** In-depth look at the JWT and secret redaction security features.
    - **[NEW]** Guide on troubleshooting common deployment issues.

---

## 📍 Manager Path (`/manager`) - (Content Gaps Identified)

### **📊 The Value: ROI & Use Cases**
- **Content:** Reuses "Why Developers Love This Tool" and "Real-World Examples."

### **📈 Case Studies**
- **Content Gaps:**
    - **[NEW]** Placeholder for 1-3 detailed case studies with quantifiable results.

### **📋 Adoption Guide**
- **Content Gaps:**
    - **[NEW]** A step-by-step guide for team leads on how to roll out the tool to their team.
    - **[NEW]** Best practices for integrating into existing workflows.

---

## ✅ Content Strategy Summary

- **High Reusability:** Approximately 70% of the website content can be directly sourced from the existing `README.md`.
- **Key Content Gaps:** New content is primarily needed for the **Advanced DevOps** and **Manager** user journeys. This is expected and good—it means we are creating new value for these specific personas.
- **Next Steps:** We have a clear plan for the `dev` agent to build the site structure and a clear list of new content to be written.

### **New Content Creation Plan**
1. **Advanced DevOps Guide:** Write a 500-word guide on scaling and security.
2. **Troubleshooting Section:** Compile common issues and solutions.
3. **Case Studies:** Create 2-3 fictional but realistic case studies.
4. **Adoption Guide:** Develop a step-by-step rollout plan.

These can be created in the next phase after the site structure is built. 