
# Analytics AI Agent – Natural Language Data Visualization

![Project Screenshot](https://raw.githubusercontent.com/sanskaryo/Analytics-AI-Agent/main/image.png)

## Overview

**Analytics AI Agent** is an AI-powered data visualization system that enables users to upload structured datasets (CSV/Excel) and generate insights using natural language queries.

Instead of manually writing aggregation logic or configuring charts, users can simply ask:

* “Show sales trend by region over time.”
* “Compare revenue distribution across categories.”

The system interprets the query using LLM-based reasoning and dynamically generates relevant visualizations.

---

## Problem It Solves

Traditional data exploration requires:

* SQL knowledge
* BI tool expertise
* Manual configuration of visualizations

This project removes that friction by enabling:

* Conversational analytics
* Automated chart generation
* Faster insight extraction

It bridges the gap between raw datasets and actionable insights.

---

## Core Features

### 1. Dataset Upload

* Supports CSV and Excel files
* Automatic parsing and schema detection

### 2. AI-Powered Querying

* Natural language understanding via LLM integration
* Converts queries into structured data operations
* Dynamically selects suitable visualization types

### 3. Interactive Dashboard

* Suggested visualizations
* Responsive UI
* Clean component-based structure

### 4. Downloadable Charts

* Export visualizations as images
* Useful for reports and presentations

---

## Technical Architecture

### Frontend

* React (TypeScript)
* Vite
* Tailwind CSS
* shadcn-ui

### AI Layer

* LLM service abstraction
* Query-to-visualization logic generation

### Data Processing

* Custom React hooks for dataset handling
* Utility modules for transformation and aggregation

---

## Project Structure

```
├── public
├── src
│   ├── components
│   │   ├── ui
│   │   ├── ChatInterface.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DataVisualizer.tsx
│   ├── hooks
│   │   └── useDataProcessing.ts
│   ├── lib
│   │   └── dataUtils.ts
│   ├── pages
│   │   └── Index.tsx
│   ├── services
│   │   ├── groqService.ts
│   │   └── llmService.ts
│   ├── App.tsx
│   ├── main.tsx
├── package.json
└── tailwind.config.ts
```

---

## Setup & Installation

### Prerequisites

* Node.js (v18+ recommended)
* npm

### Installation

```bash
git clone https://github.com/sanskaryo/Analytics-AI-Agent.git
cd Analytics-AI-Agent
npm install
npm run dev
```

Application runs at:

```
http://localhost:5173
```

---

## Example Use Cases

* Business performance analysis
* Academic dataset exploration
* Startup KPI dashboards
* Rapid exploratory data analysis (EDA)
* Internal analytics tools

---

## Design Principles

* Modular service abstraction for easy LLM swapping
* Separation of UI and processing logic
* Type-safe architecture using TypeScript
* Scalable component structure

---

## Future Enhancements

* Multi-dataset comparison
* SQL query generation mode
* Advanced statistical summaries
* Persistent query history
* Role-based access control

---

## Deployment

Supports deployment on:

* Vercel
* Netlify

Build command:

```bash
npm run build
```

---

## License

MIT License

---

## Author

**Sanskar Khandelwal**
 ### B.Tech AIML (Pre-Final Year)
 ### Focused on AI systems, data applications, and production-grade LLM workflows
