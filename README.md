Safety App

Safety App is a Health and Safety management application designed for on-site monitoring of workplace safety. It allows employees to log incidents, track actions, take photos, and manage QA templates, all while ensuring data is tied to individual users. The app helps streamline incident reporting and auditing processes, improving workplace safety compliance.

Features

User Authentication:
Login with individual credentials to view personal and role-specific data.

Issue Management:

Log safety issues or incidents.

Include descriptions, status, and photos for accurate reporting.

Record ID auto-tracking for all issues.

Action Tracking:

Create follow-up actions linked to specific issues.

Track progress and status of actions.

Photo Capture:

Capture photos directly from the app for incident evidence.

Attach photos to issues or actions.

Templates & QA Audits:

Create templates for safety audits.

Store audit questions and answers in XML format for structured reporting.

User-Specific Data:

Users only see issues and actions related to their account.

Employee ID and associated records are automatically tracked.

Search & Filter:

Search through issues by name or description.

Filter actions and audits efficiently.

Responsive UI:

Built with React for a responsive and intuitive user interface.

Tech Stack

Frontend: React, React Icons, CSS

Backend: Node.js, Express

Database: Microsoft SQL Server

Authentication: JWT (JSON Web Tokens)

File Handling: Photo capture and storage as hexadecimal binary in SQL

XML Processing: Cheerio + js2xmlparser for template management

Getting Started
Prerequisites

Node.js (v18+ recommended)

npm

Microsoft SQL Server (with SafetyApp database)

ODBC Driver 17 for SQL Server
