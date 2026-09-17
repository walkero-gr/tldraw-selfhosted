import { getLocalStorageItem, setLocalStorageItem } from './localStorage'
import { uniqueId } from 'tldraw'

const CURRENT_USER_KEY = 'tldraw-current-user-id'
const USER_NAME_KEY_PREFIX = 'tldraw-user-name-'

export function getCurrentUserId(): string {
	let userId = getLocalStorageItem(CURRENT_USER_KEY)
	if (!userId) {
		userId = 'user-' + uniqueId()
		setLocalStorageItem(CURRENT_USER_KEY, userId)
	}
	return userId
}

export function getCurrentUserName(): string {
	const userId = getCurrentUserId()
	const name = getLocalStorageItem(USER_NAME_KEY_PREFIX + userId)
	return name || userId.substring(0, 12)
}

export function setCurrentUserName(name: string): void {
	const userId = getCurrentUserId()
	if (name.trim()) {
		setLocalStorageItem(USER_NAME_KEY_PREFIX + userId, name.trim())
	}
}

export function startNewSession(): void {
	const newUserId = 'user-' + uniqueId()
	setLocalStorageItem(CURRENT_USER_KEY, newUserId)
}
