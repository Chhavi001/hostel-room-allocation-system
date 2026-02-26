# Hostel Room Allocation System

A smart web-based application for managing hostel rooms and automatically allocating rooms to students based on their requirements.

## Features

- **Add Rooms**: Add new hostel rooms with details like room number, capacity, AC availability, and washroom attachment
- **View All Rooms**: Display all available rooms in an organized grid layout
- **Search & Filter**: Search rooms by room number and filter by capacity
- **Smart Allocation**: Automatically allocate the smallest suitable room based on student requirements
- **Persistent Storage**: Room data is saved locally in the browser

## Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage for data persistence

## How to Use

### Adding a Room

1. Enter the room number
2. Specify the capacity (number of students)
3. Check AC if the room has air conditioning
4. Check Washroom if the room has an attached washroom
5. Click "Add Room"

### Allocating a Room

1. Enter the number of students
2. Select whether AC is required
3. Select whether an attached washroom is required
4. Click "Find Room"
5. The system will allocate the smallest available room that meets all requirements

### Searching Rooms

- Use the search box to find rooms by room number
- Use the capacity dropdown to filter rooms by capacity

## Allocation Algorithm

The system uses a smart allocation algorithm that:
1. Filters rooms based on requirements (capacity, AC, washroom)
2. Excludes already allocated rooms
3. Sorts eligible rooms by capacity
4. Allocates the smallest suitable room to minimize wastage

## Installation

No installation required! Just open `index.html` in a modern web browser.

## Live Demo

[Live URL will be added after deployment]

## Project Structure

```
├── index.html      # Main HTML file
├── styles.css      # Styling
├── app.js          # JavaScript logic
└── README.md       # Documentation
```

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Start using the application

## Data Persistence

Room data is stored in the browser's LocalStorage, so your data persists across sessions on the same device and browser.
