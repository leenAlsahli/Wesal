<p align="center">
  <img src="src/assets/logo.png" alt="Wesal Logo" width="240">
</p>


A complete database design project for a help desk system called **Wesal** — a name that reflects connection and communication, bridging the gap between inquiry and response to deliver the right support at the right time.

## Overview
Wesal was built as an end-to-end database design project, following the full academic database design lifecycle: starting from conceptual modeling (ER), moving through enhanced conceptual modeling (EER), mapping the design into a relational schema, implementing it in a live database, and finally connecting it to a functional front-end for real-world interaction — turning a theoretical design exercise into a working help desk platform.

## Features
- Ticket submission and tracking for support requests
- **Real-time ticket dashboard** — live updates on inquiries and responses powered by Supabase's real-time subscriptions
- Structured relational database supporting the full help desk workflow
- Front-end interface connected directly to the underlying database via Supabase

## Tech Stack
- **Database Design:** ER Diagram → EER Diagram → Relational Mapping → Implementation
- **Database & Backend:** Supabase (PostgreSQL) with real-time subscriptions
- **Frontend Framework:** Vue.js
- **Styling:** HTML, CSS
- **Interactivity:** JavaScript

## Development Process
1. **ER Modeling:** Defined core entities, attributes, and relationships within the help desk domain (tickets, users, departments, responses).
2. **EER Modeling:** Extended the ER model with specialization/generalization where applicable, refining the conceptual design.
3. **Mapping:** Translated the EER model into a relational schema, defining tables, keys, and constraints.
4. **Implementation:** Implemented the finalized schema in Supabase (PostgreSQL), populating it with structured data to support the system's operations.
5. **Front-End Integration:** Connected the Vue.js front end to Supabase, using HTML/CSS for layout and design, JavaScript for interactivity, and Supabase's real-time subscriptions to keep the ticket dashboard live without manual refreshing.


## Author's Contribution
Leen Alsahli — [LinkedIn](https://linkedin.com/in/leen-alsahli-1064a6305) | [Portfolio](https://leen-portfolio-inky.vercel.app)
