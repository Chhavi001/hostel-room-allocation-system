var rooms = [];
var allocated = new Set();

function load() {
    var data = localStorage.getItem('rooms');
    if (data) rooms = JSON.parse(data);
    var alloc = localStorage.getItem('allocated');
    if (alloc) allocated = new Set(JSON.parse(alloc));
}

function save() {
    localStorage.setItem('rooms', JSON.stringify(rooms));
    localStorage.setItem('allocated', JSON.stringify(Array.from(allocated)));
}

function refreshStats() {
    var total = rooms.length;
    var used = allocated.size;
    var free = total - used;
    document.getElementById('statsBar').innerHTML =
        '<span>Total: ' + total + '</span>' +
        '<span>Available: ' + free + '</span>' +
        '<span>Occupied: ' + used + '</span>';
}

function renderRooms(list) {
    var container = document.getElementById('roomsList');
    var data = list || rooms;

    if (data.length === 0) {
        container.innerHTML = '<div class="no-rooms"><p>No rooms to show. Add some using the form.</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var r = data[i];
        var isOccupied = allocated.has(r.roomNo);

        var tags = '';
        if (r.hasAC) tags += '<span class="tag ac">AC</span>';
        if (r.hasAttachedWashroom) tags += '<span class="tag wr">Washroom</span>';
        if (isOccupied) tags += '<span class="tag occ">Occupied</span>';

        html += '<div class="room-card' + (isOccupied ? ' occupied' : '') + '">';
        html += '<div class="room-top">';
        html += '<strong>Room ' + r.roomNo + '</strong>';
        html += '<button class="rm-btn" onclick="removeRoom(\'' + r.roomNo + '\')">&times;</button>';
        html += '</div>';
        html += '<div class="room-info">';
        html += 'Capacity: ' + r.capacity + '<br>';
        html += 'Status: ' + (isOccupied ? 'Occupied' : 'Available');
        html += '</div>';
        html += '<div class="tags">' + tags + '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

document.getElementById('addRoomForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var roomNo = document.getElementById('roomNo').value.trim();
    var cap = parseInt(document.getElementById('capacity').value);
    var ac = document.getElementById('hasAC').checked;
    var washroom = document.getElementById('hasWashroom').checked;

    if (!roomNo) {
        toast('Enter a room number', false);
        return;
    }
    if (isNaN(cap) || cap < 1) {
        toast('Capacity should be at least 1', false);
        return;
    }

    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomNo === roomNo) {
            toast('Room ' + roomNo + ' already exists', false);
            return;
        }
    }

    rooms.push({
        roomNo: roomNo,
        capacity: cap,
        hasAC: ac,
        hasAttachedWashroom: washroom
    });

    save();
    renderRooms();
    refreshStats();
    this.reset();
    toast('Room ' + roomNo + ' added');
});

function removeRoom(no) {
    if (!confirm('Remove room ' + no + '?')) return;

    var updated = [];
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomNo !== no) updated.push(rooms[i]);
    }
    rooms = updated;
    allocated.delete(no);
    save();
    renderRooms();
    refreshStats();
    toast('Room ' + no + ' removed');
}

document.getElementById('allocateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var count = parseInt(document.getElementById('studentCount').value);
    var wantAC = document.getElementById('needsAC').checked;
    var wantWR = document.getElementById('needsWashroom').checked;
    var box = document.getElementById('allocationResult');

    if (isNaN(count) || count < 1) {
        toast('Enter valid student count', false);
        return;
    }

    var candidates = [];
    for (var i = 0; i < rooms.length; i++) {
        var r = rooms[i];
        if (allocated.has(r.roomNo)) continue;
        if (r.capacity < count) continue;
        if (wantAC && !r.hasAC) continue;
        if (wantWR && !r.hasAttachedWashroom) continue;
        candidates.push(r);
    }

    if (candidates.length === 0) {
        box.className = 'msg-box fail';
        box.innerHTML = '<b>No room available</b> matching your requirements.';
        return;
    }

    candidates.sort(function(a, b) { return a.capacity - b.capacity; });
    var picked = candidates[0];

    allocated.add(picked.roomNo);
    save();
    renderRooms();
    refreshStats();

    var info = '<b>Allocated Room ' + picked.roomNo + '</b><br>';
    info += 'Capacity: ' + picked.capacity;
    if (picked.hasAC) info += ' | AC: Yes';
    if (picked.hasAttachedWashroom) info += ' | Washroom: Yes';
    box.className = 'msg-box ok';
    box.innerHTML = info;
});

document.getElementById('deallocateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var no = document.getElementById('deallocateRoomNo').value.trim();
    var box = document.getElementById('deallocateResult');

    if (!no) {
        toast('Enter room number', false);
        return;
    }

    var found = false;
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomNo === no) { found = true; break; }
    }

    if (!found) {
        box.className = 'msg-box fail';
        box.innerHTML = 'Room ' + no + ' doesn\'t exist.';
        return;
    }

    if (!allocated.has(no)) {
        box.className = 'msg-box fail';
        box.innerHTML = 'Room ' + no + ' is already free.';
        return;
    }

    allocated.delete(no);
    save();
    renderRooms();
    refreshStats();
    box.className = 'msg-box ok';
    box.innerHTML = 'Room ' + no + ' freed up!';
    document.getElementById('deallocateRoomNo').value = '';
});

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('filterCapacity').addEventListener('change', applyFilters);
document.getElementById('filterAC').addEventListener('change', applyFilters);
document.getElementById('filterWashroom').addEventListener('change', applyFilters);

function applyFilters() {
    var term = document.getElementById('searchInput').value.toLowerCase();
    var capVal = document.getElementById('filterCapacity').value;
    var acVal = document.getElementById('filterAC').value;
    var wrVal = document.getElementById('filterWashroom').value;

    var result = [];
    for (var i = 0; i < rooms.length; i++) {
        var r = rooms[i];
        if (term && r.roomNo.toLowerCase().indexOf(term) === -1) continue;

        if (capVal) {
            var c = parseInt(capVal);
            if (c >= 4) { if (r.capacity < 4) continue; }
            else { if (r.capacity !== c) continue; }
        }

        if (acVal === 'yes' && !r.hasAC) continue;
        if (acVal === 'no' && r.hasAC) continue;
        if (wrVal === 'yes' && !r.hasAttachedWashroom) continue;
        if (wrVal === 'no' && r.hasAttachedWashroom) continue;

        result.push(r);
    }

    renderRooms(result);
}

function toast(msg, success) {
    if (success === undefined) success = true;
    var el = document.createElement('div');
    el.className = 'toast';
    el.style.background = success ? '#27ae60' : '#e74c3c';
    el.textContent = msg;
    document.body.appendChild(el);

    setTimeout(function() { el.classList.add('show'); }, 10);
    setTimeout(function() {
        el.classList.remove('show');
        setTimeout(function() { el.remove(); }, 300);
    }, 2200);
}

load();
renderRooms();
refreshStats();
