# Piggy – Personal Money Manager (AngularJS 1.x)

Track income and spending, fill piggy-bank savings goals, and plan monthly investments.

## Run it
1. Unzip the folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Keep an internet connection on: AngularJS, Bootstrap 5, Font Awesome and Google Fonts load from CDNs.

No build step or server is needed. Optional: `python -m http.server` in the folder, then visit http://localhost:8000.

## Features
- **Dashboard**: balance, income, spending, piggy-bank jar, income sources, spending by category, latest activity.
- **Income & spending**: add, edit, delete, search, filter by type, sort, form validation.
- **Piggy bank**: create goals, add money (deducted from balance), progress bars.
- **Investing**: SIP projection calculator and saved plans (estimates only, not guaranteed returns).
- Data is saved in your browser (localStorage). "Reset demo data" restores the sample data.

## Files
- `index.html` – layout and views
- `css/style.css` – design system and responsive rules
- `js/app.js` – module, `inr` filter, `statCard` directive
- `js/services.js` – storage, notifications, finance logic
- `js/controllers.js` – page controllers
