let rooms = [];
let allocatedRooms = new Set();

function loadRooms() {
    const savedRooms = localStorage.getItem('hostelRooms');
    if (savedRooms) {
        rooms = JSON.parse(savedRooms);
    }
    
    const savedAllocated = localStorage.getItem('allocatedRooms');
    if (savedAllocated) {
        allocatedRooms = new Set(JSON.parse(savedAllocated));
    }
}

function saveRooms() {
    localStorage.setItem('hostelRooms', JSON.stringify(rooms));
    localStorage.setItem('allocatedRooms', JSON.stringify([...allocatedRooms]));
}

document.getElementById('addRoomForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const roomNo = document.getElementById('roomNo').value.trim();
    const capacity = parseInt(document.getElementById('capacity').value);
    const hasAC = document.getElementById('hasAC').checked;
    const hasWashroom = document.getElementById('hasWashroom').checked;
    
    if (rooms.some(room => room.roomNo === roomNo)) {
        alert('Room number already exists!');
        return;
    }
    
    const newRoom = {
        roomNo: roomNo,
        capacity: capacity,
        hasAC: hasAC,
        hasAttachedWashroom: hasWashroom
    };
    
    rooms.push(newRoom);
    saveRooms();
    displayRooms();
    
    this.reset();
    showNotification('Room added successfully!', 'success');
});

function displayRooms(filteredRooms = null) {
    const roomsList = document.getElementById('roomsList');
    const roomsToDisplay = filteredRooms || rooms;
    
    if (roomsToDisplay.length === 0) {
        roomsList.innerHTML = `
            <div class="empty-state">
                <h3>No rooms available</h3>
                <p>Add rooms using the form on the left</p>
            </div>
        `;
        return;
    }
    
    roomsList.innerHTML = '';
    
    roomsToDisplay.forEach(room => {
        const isAllocated = allocatedRooms.has(room.roomNo);
        const roomCard = document.createElement('div');
        roomCard.className = `room-card ${isAllocated ? 'allocated' : ''}`;
        
        roomCard.innerHTML = `
            <div class="room-number">Room ${room.roomNo}</div>
            <div class="room-details">
                <div class="room-detail-item">Capacity: ${room.capacity} student${room.capacity > 1 ? 's' : ''}</div>
            </div>
            <div class="room-features">
                ${room.hasAC ? '<span class="feature-badge ac">AC</span>' : ''}
                ${room.hasAttachedWashroom ? '<span class="feature-badge washroom">Washroom</span>' : ''}
                ${isAllocated ? '<span class="feature-badge allocated">Allocated</span>' : ''}
            </div>
        `;
        
        roomsList.appendChild(roomCard);
    });
}

document.getElementById('allocateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentCount = parseInt(document.getElementById('studentCount').value);
    const needsAC = document.getElementById('needsAC').checked;
    const needsWashroom = document.getElementById('needsWashroom').checked;
    
    const result = allocateRoom(studentCount, needsAC, needsWashroom);
    displayAllocationResult(result);
});

function allocateRoom(students, needsAC, needsWashroom) {
    const availableRooms = rooms.filter(room => {
        if (allocatedRooms.has(room.roomNo)) return false;
        if (room.capacity < students) return false;
        if (needsAC && !room.hasAC) return false;
        if (needsWashroom && !room.hasAttachedWashroom) return false;
        return true;
    });
    
    if (availableRooms.length === 0) {
        return { success: false, message: 'No room available' };
    }
    
    availableRooms.sort((a, b) => a.capacity - b.capacity);
    const allocatedRoom = availableRooms[0];
    
    allocatedRooms.add(allocatedRoom.roomNo);
    saveRooms();
    displayRooms();
    
    return {
        success: true,
        room: allocatedRoom,
        message: `Room ${allocatedRoom.roomNo} allocated successfully!`
    };
}

function displayAllocationResult(result) {
    const resultBox = document.getElementById('allocationResult');
    
    if (result.success) {
        resultBox.className = 'result-box success';
        resultBox.innerHTML = `
            <strong>${result.message}</strong><br>
            Capacity: ${result.room.capacity} student${result.room.capacity > 1 ? 's' : ''}<br>
            ${result.room.hasAC ? 'AC: Yes<br>' : ''}
            ${result.room.hasAttachedWashroom ? 'Attached Washroom: Yes' : ''}
        `;
    } else {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = `<strong>${result.message}</strong>`;
    }
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    filterRooms();
});

document.getElementById('filterCapacity').addEventListener('change', function(e) {
    filterRooms();
});

function filterRooms() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const capacityFilter = document.getElementById('filterCapacity').value;
    
    let filtered = rooms;
    
    if (searchTerm) {
        filtered = filtered.filter(room => 
            room.roomNo.toLowerCase().includes(searchTerm)
        );
    }
    
    if (capacityFilter) {
        const cap = parseInt(capacityFilter);
        if (cap === 4) {
            filtered = filtered.filter(room => room.capacity >= 4);
        } else {
            filtered = filtered.filter(room => room.capacity === cap);
        }
    }
    
    displayRooms(filtered);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

loadRooms();
displayRooms();
