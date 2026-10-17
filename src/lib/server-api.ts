import { Room, RoomMember } from '../types/game';

const API_BASE = ''; // relative to current host/port

export async function apiCreateRoom(room: Room): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    const data = await res.json();
    return data.success ? data.room : null;
  } catch (err) {
    console.error('Failed to create room via server API:', err);
    return null;
  }
}

export async function apiGetRoom(code: string): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE}/api/rooms/${code.toUpperCase()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.room : null;
  } catch (err) {
    console.error('Failed to get room via server API:', err);
    return null;
  }
}

export async function apiJoinRoom(code: string, member: RoomMember): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE}/api/rooms/${code.toUpperCase()}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member }),
    });
    const data = await res.json();
    return data.success ? data.room : null;
  } catch (err) {
    console.error('Failed to join room via server API:', err);
    return null;
  }
}

export async function apiUpdateRoom(code: string, room: Partial<Room>): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE}/api/rooms/${code.toUpperCase()}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room }),
    });
    const data = await res.json();
    return data.success ? data.room : null;
  } catch (err) {
    console.error('Failed to update room via server API:', err);
    return null;
  }
}
