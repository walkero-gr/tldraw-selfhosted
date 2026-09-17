import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from './localStorage'
import { getCurrentUserId } from './userSession'

export interface RoomHistory {
	id: string
	name?: string
	createdAt: number
	lastAccessedAt: number
	createdByUser: string
}

const ROOMS_KEY = 'tldraw-room-history'

export function getRoomHistory(): RoomHistory[] {
	const stored = getLocalStorageItem(ROOMS_KEY)
	if (!stored) return []
	try {
		return JSON.parse(stored)
	} catch {
		return []
	}
}

export function addRoom(roomId: string): void {
	const rooms = getRoomHistory()
	const userId = getCurrentUserId()
	const existing = rooms.find(r => r.id === roomId)
	
	if (existing) {
		existing.lastAccessedAt = Date.now()
	} else {
		rooms.push({
			id: roomId,
			createdAt: Date.now(),
			lastAccessedAt: Date.now(),
			createdByUser: userId,
		})
	}
	
	setLocalStorageItem(ROOMS_KEY, JSON.stringify(rooms))
}

export function deleteRoom(roomId: string): void {
	const rooms = getRoomHistory().filter(r => r.id !== roomId)
	setLocalStorageItem(ROOMS_KEY, JSON.stringify(rooms))
}

export function getLastRoom(): RoomHistory | null {
	const rooms = getRoomHistory()
	return rooms.length > 0 ? rooms[rooms.length - 1] : null
}

export function sortedRooms(): RoomHistory[] {
	const userId = getCurrentUserId()
	return getRoomHistory()
		.filter(r => r.createdByUser === userId)
		.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
}

export function updateRoomName(roomId: string, name: string): void {
	const rooms = getRoomHistory()
	const room = rooms.find(r => r.id === roomId)
	if (room) {
		room.name = name || undefined
		setLocalStorageItem(ROOMS_KEY, JSON.stringify(rooms))
	}
}

export function getRoomName(roomId: string): string | undefined {
	const rooms = getRoomHistory()
	const room = rooms.find(r => r.id === roomId)
	return room?.name
}
