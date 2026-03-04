# CTU Calendar (ctucal)

A Node.js web application that automatically fetches your assessment tasks from the CTU Campus Manager portal and exports them as an iCalendar (.ics) file. This allows you to import your academic calendar directly into any calendar application that supports the iCalendar format.

## Purpose

CTU Calendar simplifies academic planning by:
- Automatically logging into your CTU Campus Manager student portal
- Extracting assessment details (modules, assessments, due dates)
- Converting tasks into a standard iCalendar format
- Generating a downloadable `.ics` file that can be imported into calendar applications like Google Calendar, Outlook, or Apple Calendar

## Prerequisites

Before installing, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EthanLeRoux/ctucal.git
   cd ctucal
