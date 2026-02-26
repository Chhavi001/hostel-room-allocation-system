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

function updateStats() {
    const totalRooms = rooms.length;
    const allocatedCount = allocatedRooms.size;
    const freeCount = totalRooms - allocatedCount;

    document.getElementById('statsBar').innerHTML = `
        <div class="stat-item">Total: ${totalRooms}</div>
        <div class="stat-item">Free: ${freeCount}</div>
        <div class="stat-item">Allocated: ${allocatedCount}</div>
    `;
}

document.getElementById('addRoomForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const roomNo = document.getElementById('roomNo').value.trim();
    const capacity = parseInt(document.getElementById('capacity').value);
    const hasAC = document.getElementById('hasAC').checked;
    const hasWashroom = document.getElementById('hasWashroom').checked;

    if (!roomNo) {
        showNotification('Please enter a room number', 'error');
        return;
    }

    if (isNaN(capacity) || capacity < 1) {
        showNotification('Capacity must be at least 1', 'error');
        return;
    }

    if (rooms.some(room => room.roomNo === roomNo)) {
        showNotification('Room ' + roomNo + ' already exists!', 'error');
        return;
    }

    var newRoom = {
        roomNo: roomNo,
        capacity: capacity,
        hasAC: hasAC,
        hasAttachedWashroom: hasWashroom
    };

    rooms.push(newRoom);
    saveRooms();
    displayRooms();
    updateStats();

    this.reset();
    showNotification('Room ' + roomNo + ' added successfully!', 'success');
});

function deleteRoom(roomNo) {
    if (!confirm('Delete room ' + roomNo + '?')) return;

    rooms = rooms.filter(function(room) {
        return room.roomNo !== roomNo;
    });
    allocatedRooms.delete(roomNo);
    saveRooms();
    displayRooms();
    updateStats();
    showNotification('Room ' + roomNo + ' deleted', 'success');
}

function displayRooms(filteredRooms) {
    var roomsList = document.getElementById('roomsList');
    var roomsToDisplay = filteredRooms || rooms;

    if (roomsToDisplay.length === 0) {
        roomsList.innerHTML = '<div class="empty-state"><h3>No rooms found</h3><p>Add rooms using the form on the left</p></div>';
        return;
    }

    roomsList.innerHTML = '';

    roomsToDisplay.forEach(function(room) {
        var isAllocated = allocatedRooms.has(room.roomNo);
        var roomCard = document.createElement('div');
        roomCard.className = 'room-card' + (isAllocated ? ' allocated' : '');

        var featuresHTML = '';
        if (room.hasAC) featuresHTML += '<span class="feature-badge ac">AC</span>';
        if (room.hasAttachedWashroom) featuresHTML += '<span class="feature-badge washroom">Washroom</span>';
        if (isAllocated) featuresHTML += '<span class="feature-badge allocated">Occupied</span>';

        roomCard.innerHTML = '<div class="room-header"><div class="room-number">Room ' + room.roomNo + '</div>' +
            '<button class="delete-btn" onclick="deleteRoom(\'' + room.roomNo + '\')" title="Delete room">&#10005;</button></div>' +
            '<div class="room-details"><div class="room-detail-item">Capacity: ' + room.capacity + ' student' + (room.capacity > 1 ? 's' : '') + '</div>' +
            '<div class="room-detail-item">Status: ' + (isAllocated ? 'Occupied' : 'Available') + '</div></div>' +
            '<div class="room-features">' + featuresHTML + '</div>';

        roomsList.appendChild(roomCard);
    });
}

document.getElementById('allocateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var studentCount = parseInt(document.getElementById('studentCount').value);
    var needsAC = document.getElementById('needsAC').checked;
    var needsWashroom = document.getElementById('needsWashroom').checked;

    if (isNaN(studentCount) || studentCount < 1) {
        showNotification('Enter a valid number of students', 'error');
        return;
    }

    var result = allocateRoom(studentCount, needsAC, needsWashroom);
    displayAllocationResult(result);
});

function allocateRoom(students, needsAC, needsWashroom) {
    var availableRooms = rooms.filter(function(room) {
        if (allocatedRooms.has(room.roomNo)) return false;
        if (room.capacity < students) return false;
        if (needsAC && !room.hasAC) return false;
        if (needsWashroom && !room.hasAttachedWashroom) return false;
        return true;
    });

    if (availableRooms.length === 0) {
        return { success: false, message: 'No room available matching these requirements' };
    }

    availableRooms.sort(function(a, b) { return a.capacity - b.capacity; });
    var best = availableRooms[0];

    allocatedRooms.add(best.roomNo);
    saveRooms();
    displayRooms();
    updateStats();

    return {
        success: true,
        room: best,
        message: 'Room ' + best.roomNo + ' has been allocated!'
    };
}

function displayAllocationResult(result) {
    var resultBox = document.getElementById('allocationResult');

    if (result.success) {
        resultBox.className = 'result-box success';
        var html = '<strong>' + result.message + '</strong><br>';
        html += 'Capacity: ' + result.room.capacity + ' student' + (result.room.capacity > 1 ? 's' : '') + '<br>';
        if (result.room.hasAC) html += 'AC: Yes<br>';
        if (result.room.hasAttachedWashroom) html += 'Attached Washroom: Yes';
        resultBox.innerHTML = html;
    } else {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = '<strong>' + result.message + '</strong>';
    }
}

document.getElementById('deallocateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var roomNo = document.getElementById('deallocateRoomNo').value.trim();
    var resultBox = document.getElementById('deallocateResult');

    if (!roomNo) {
        showNotification('Enter a room number', 'error');
        return;
    }

    var roomExists = rooms.some(function(r) { return r.roomNo === roomNo; });
    if (!roomExists) {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = '<strong>Room ' + roomNo + ' does not exist</strong>';
        return;
    }

    if (!allocatedRooms.has(roomNo)) {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = '<strong>Room ' + roomNo + ' is not currently allocated</strong>';
        return;
    }

    allocatedRooms.delete(roomNo);
    saveRooms();
    displayRooms();
    updateStats();

    resultBox.className = 'result-box success';
    resultBox.innerHTML = '<strong>Room ' + roomNo + ' is now free</strong>';
    document.getElementById('deallocateRoomNo').value = '';
});

document.getElementById('searchInput').addEventListener('input', function() {
    filterRooms();
});

document.getElementById('filterCapacity').addEventListener('change', function() {
    filterRooms();
});

document.getElementById('filterAC').addEventListener('change', function() {
    filterRooms();
});

document.getElementById('filterWashroom').addEventListener('change', function() {
    filterRooms();
});

function filterRooms() {
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();
    var capacityFilter = document.getElementById('filterCapacity').value;
    var acFilter = document.getElementById('filterAC').value;
    var washroomFilter = document.getElementById('filterWashroom').value;

    var filtered = rooms;

    if (searchTerm) {
        filtered = filtered.filter(function(room) {
            return room.roomNo.toLowerCase().indexOf(searchTerm) !== -1;
        });
    }

    if (capacityFilter) {
        var cap = parseInt(capacityFilter);
        if (cap >= 4) {
            filtered = filtered.filter(function(room) { return room.capacity >= 4; });
        } else {
            filtered = filtered.filter(function(room) { return room.capacity === cap; });
        }
    }

    if (acFilter === 'yes') {
        filtered = filtered.filter(function(room) { return room.hasAC; });
    } else if (acFilter === 'no') {
        filtered = filtered.filter(function(room) { return !room.hasAC; });
    }

    if (washroomFilter === 'yes') {
        filtered = filtered.filter(function(room) { return room.hasAttachedWashroom; });
    } else if (washroomFilter === 'no') {
        filtered = filtered.filter(function(room) { return !room.hasAttachedWashroom; });
    }

    displayRooms(filtered);
}

function showNotification(message, type) {
    var notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 20px;' +
        'background:' + (type === 'success' ? '#48bb78' : '#f56565') + ';color:white;' +
        'border-radius:6px;box-shadow:0 5px 15px rgba(0,0,0,0.3);z-index:1000;' +
        'animation:slideIn 0.3s ease;font-weight:500;';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() { notification.remove(); }, 300);
    }, 2500);
}

loadRooms();
displayRooms();
updateStats();
