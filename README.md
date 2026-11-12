# LittleSteps — Childcare Center Management System

A responsive front-end childcare center management dashboard built using **HTML5, CSS3 and vanilla JavaScript**. Data is stored in the browser using **LocalStorage**.

## Run the project
1. Extract `Childcare-Center-Management-System.zip`.
2. Open the extracted folder.
3. Double-click `index.html` to open it in Chrome, Edge or Firefox.

No installation, server, database or build step is required.

## Included modules
- Dashboard overview
- Child profiles
- Guardian management
- Attendance check-in/check-out records
- Authorized pickup records
- Daily activities
- Meal records
- Health records
- Notifications

## Functionality
- Add, edit and delete records
- Search current module records
- Basic status/date filtering
- CSV export for each module
- Responsive desktop and mobile layout
- Form validation for selected fields
- LocalStorage persistence after browser refresh

## Important notes
- The app starts with fictional sample data so the dashboard is populated for demonstration.
- Use the browser's local storage for this site to retain your demo records.
- To reset to the original sample data, open browser developer tools → Application/Storage → Local Storage, delete the `littlesteps_childcare_v1` key, then refresh.
- LocalStorage is not secure storage. This project is suitable for a classroom prototype with fictional data only. Do not enter real children's personal, medical or guardian information. A real childcare service needs secure authentication, role-based permissions, encrypted server-side storage, backups, audit logs and verified notification delivery.
- Pickup approval in this demo is a record-keeping aid only. It does not establish identity or replace a real-world safeguarding procedure.

## Project structure
```
Childcare-Center-Management-System/
├── index.html
├── style.css
├── app.js
└── README.md
```
