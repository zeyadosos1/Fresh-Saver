# Fresh Saver Platform Framework

This project framework encapsulates a modern, decoupled architecture featuring an Angular frontend application and a lightweight, flat-file PHP backend.

## Project Structure
- **/api/** - Contains the PHP backend endpoints (`_bootstrap.php`, `login.php`, `register.php`, `deals.php`, `deal_actions.php`).
- **/fresh-saver-app/** - Contains the Angular frontend application.
- **config.php** - Database configuration variables for the PHP API.
- **schema.sql** - Database schema definitions for easy setup.
- **.htaccess** - Apache configuration for securing sensitive files and managing directory listing.

## Setup Instructions

1. **Database Setup**
   - Create a database in MySQL (e.g., `users_db`).
   - Import the `schema.sql` file to create the `users` and `deals` tables.
   - Update `config.php` with your local database credentials if they differ from the defaults.

2. **Backend (PHP API)**
   - Ensure the `project_framework` folder is placed in your local web server's document root (e.g., XAMPP `htdocs`).
   - Verify XAMPP Apache and MySQL are running.
   - Test by visiting `http://localhost/project_framework/api/deals.php` in your browser.

3. **Frontend (Angular)**
   - Navigate into the `/fresh-saver-app` directory: `cd fresh-saver-app`
   - Install dependencies: `npm install`
   - Run the development server: `npm start` (or `ng serve`)
   - The application will be available at `http://localhost:4200`
