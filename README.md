# Hostel Room Allocation System

A web application for managing hostel rooms and automatically allocating rooms to students based on capacity and facility requirements.

## Features

- **Add Rooms** - Create hostel rooms with room number, capacity, AC, and attached washroom options
- **View All Rooms** - See all rooms in a grid layout with their current status
- **Search & Filter** - Search by room number, filter by capacity, AC availability, and washroom
- **Smart Allocation** - Automatically assigns the smallest suitable room that matches all requirements
- **Deallocate Rooms** - Free up allocated rooms when students leave
- **Delete Rooms** - Remove rooms from the system
- **Data Persistence** - All data is saved in browser localStorage

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage

## How It Works

### Adding a Room

1. Enter room number (must be unique)
2. Set the capacity
3. Toggle AC and attached washroom as needed
4. Click "Add Room"

### Allocating a Room

1. Enter how many students need a room
2. Check if AC is required
3. Check if attached washroom is required
4. Click "Find Room"
5. The system picks the smallest available room that fits all criteria
6. If nothing matches, it shows "No room available"

### Searching and Filtering

- Type in the search box to find rooms by number
- Use dropdowns to filter by capacity, AC, or washroom availability

### Deallocating

- Enter the room number in the Deallocate section
- Click "Free Room" to make it available again

## Allocation Logic

The algorithm works like this:
1. Filter out already allocated rooms
2. Filter out rooms that are too small
3. If AC is needed, only keep rooms with AC
4. If washroom is needed, only keep rooms with attached washroom
5. Sort remaining rooms by capacity (ascending)
6. Pick the first one (smallest that fits)

This ensures minimal wastage of room capacity.

## Project Structure

```
├── index.html       # Main page
├── styles.css       # All styles
├── app.js           # Application logic
├── vercel.json      # Deployment config
└── README.md        # This file
```

## Running Locally

1. Clone the repo
2. Open `index.html` in any browser
3. No build step or server needed

## Deployment

Deployed on Vercel. Live URL: [will be updated after deployment]

## Browser Support

Chrome, Firefox, Safari, Edge (all modern browsers)
