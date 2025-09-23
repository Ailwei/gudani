# StudySmartAI - AI Study Assistant MVP for High School Learners (Grades 8–12)

## Overview

**StudySmartAI** is an AI-powered web application designed to help high school learners (Grades 8–12) study more effectively with personalized, curriculum-aligned tools. It addresses the challenge of overwhelming textbooks and scattered resources by providing instant explanations, flashcards, smart quizzes, and summarized study notes tailored to the learner's grade and subject.

## Target Audience

- High school learners (Grades 8–12)
- Initially aligned with CAPS and IEB curricula

## Problem Statement

High school students struggle to find tailored, easy-to-understand, and curriculum-aligned study tools, often overwhelmed by dense textbooks, papers, and fragmented resources.

## MVP Goal

Create a user-friendly web application that empowers Grade 8–12 learners to study smarter through:
- Instant, grade-specific explanations
- Auto-generated flashcards
- Smart quizzes with feedback
- Simplified, curriculum-aligned study note summaries

## Core MVP Features

| Feature | Description | Value |
|---------|-------------|-------|
| **AI Study Bot** | Ask subject/topic questions, get grade-specific answers | Personalized learning tailored to teens |
| **Note Upload + Summary** | Upload or paste notes, receive simplified summaries by grade level | Faster, focused revision |
| **Quiz Generator** | Create multiple-choice quizzes from topic input based on learner’s grade and subject | Self-testing with instant feedback |
| **Flashcards** | Generate flashcards from notes or topics per grade | Active recall, mobile-friendly learning |


## Project Structure

- All routes/pages are in `src/app` (e.g., `/dashboard`, `/login`, `/register`, `/forgotpassword`, `/resetpassword`).
- Reusable UI components are in `src/components`.
- The landing page uses scroll-to-section navigation for Features, Pricing, and About.
- Authentication pages (login, register, forgot password, reset password) have a consistent logo/title and link back to the landing page.

## Monetization Strategy

- **Freemium**: Free basic tools with limited daily uses; upgrade for full access
- **Standard Subscription**: Monthly plan (e.g., R29/month) for limited flashcards, quizzes, and summaries
- **Premium Subscription**: Monthly plan (e.g., R99/month) for unlimited flashcards, quizzes, and summaries
- **School Licensing**: Discounted access for school groups or tutoring centers

## Sample User Flow

1. User selects their **Grade** and **Subject** (e.g., Grade 10 Life Sciences)
2. Chooses a tool: **AI Chat**, **Flashcards**, **Quiz**, or **Upload Notes**
3. Interacts with tailored content based on their grade and subject
4. Optionally saves or exports content for revision
5. Authentication pages allow users to log in, register, reset, or recover their password, with easy navigation back to the landing page.

## Optional Next Features (Phase 2+)

- Grade-specific study planner
- Past paper upload and analysis
- Curriculum switcher (CAPS, Cambridge, IEB)
- Gamified quiz challenges
- Teacher dashboard for class use

## MVP Launch Checklist

- [x] Grade & subject selector
- [x] Define 4 core AI tools (Chat, Flashcards, Quiz, Summarizer)
- [x] Implement authentication routes (login, register, forgot password, reset password)
- [x] Scroll-to-section navigation on landing page
- [ ] Build backend APIs with grade-awareness
- [ ] Build basic React UI for interaction
- [ ] Test with Grade 8–12 learners
- [ ] Implement freemium/premium logic

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- superBase(posgrel, prisma)
- OpenAI API key

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/studysmartai.git