import { useNavigate } from 'react-router-dom'
import { uniqueId } from 'tldraw'
import { useState, useEffect, useRef } from 'react'
import { addRoom, deleteRoom, sortedRooms, updateRoomName, type RoomHistory } from '../roomHistory'
import './Root.css'

export function Root() {
	const navigate = useNavigate()
	const [rooms, setRooms] = useState<RoomHistory[]>([])
	const [showList, setShowList] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editingName, setEditingName] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setRooms(sortedRooms())
	}, [showList])

	const handleNewRoom = () => {
		const newRoomId = 'room-' + uniqueId()
		addRoom(newRoomId)
		navigate(`/${newRoomId}`)
	}

	const handleLastRoom = () => {
		const lastRoom = rooms[0]
		if (lastRoom) {
			navigate(`/${lastRoom.id}`)
		}
	}

	const handleSelectRoom = (roomId: string) => {
		navigate(`/${roomId}`)
	}

	const handleDeleteRoom = (e: React.MouseEvent, roomId: string) => {
		e.stopPropagation()
		deleteRoom(roomId)
		setRooms(sortedRooms())
	}

	const handleStartEditing = (e: React.MouseEvent, room: RoomHistory) => {
		e.stopPropagation()
		setEditingId(room.id)
		setEditingName(room.name || '')
	}

	const handleSaveName = (roomId: string) => {
		updateRoomName(roomId, editingName)
		setEditingId(null)
		setRooms(sortedRooms())
	}

	const handleKeyDown = (e: React.KeyboardEvent, roomId: string) => {
		if (e.key === 'Enter') {
			handleSaveName(roomId)
		} else if (e.key === 'Escape') {
			setEditingId(null)
		}
	}

	const handleExportRoom = (e: React.MouseEvent, room: RoomHistory) => {
		e.stopPropagation()
		try {
			const roomData = {
				room: room,
				exportedAt: new Date().toISOString(),
			}
			const json = JSON.stringify(roomData)
			const link = document.createElement('a')
			link.href = URL.createObjectURL(new Blob([json]))
			link.download = `${room.name || room.id}.tldr`
			link.click()
			URL.revokeObjectURL(link.href)
		} catch (err) {
			console.error('Export failed:', err)
		}
	}

	const handleImportClick = () => {
		fileInputRef.current?.click()
	}

	const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const json = await file.text()
			const data = JSON.parse(json)

			if (data.room && data.room.id) {
				const importedRoom = data.room as RoomHistory
				addRoom(importedRoom.id)
				updateRoomName(importedRoom.id, importedRoom.name || '')
				setRooms(sortedRooms())
				navigate(`/${importedRoom.id}`)
			} else {
				console.error('Invalid .tldr file format')
			}
		} catch (err) {
			console.error('Import failed:', err)
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<div className="Root">
			<div className="Root-container">
				<h1>tldraw</h1>

				<div className="Root-buttons">
					<button className="Root-button Root-button--primary" onClick={handleNewRoom}>
						✨ New Room
					</button>
					<button
						className="Root-button"
						onClick={handleImportClick}
					>
						⬆️ Import Room
					</button>
					{rooms.length > 0 && (
						<button className="Root-button" onClick={handleLastRoom}>
							📋 Resume Last Room
						</button>
					)}
					{rooms.length > 0 && (
						<button
							className="Root-button"
							onClick={() => setShowList(!showList)}
						>
							{showList ? '✕ Close' : '📚 Room History'} ({rooms.length})
						</button>
					)}
				</div>

				<input
					ref={fileInputRef}
					type="file"
					accept=".tldr"
					style={{ display: 'none' }}
					onChange={handleImportFile}
				/>

				{showList && rooms.length > 0 && (
					<div className="Root-list">
						<h3>Your Rooms</h3>
						<div className="Root-rooms">
							{rooms.map((room) => (
								<div
									key={room.id}
									className="Root-room-item"
									onClick={() => handleSelectRoom(room.id)}
								>
									<div className="Root-room-info">
										{editingId === room.id ? (
											<div className="Root-room-edit" onClick={(e) => e.stopPropagation()}>
												<input
													type="text"
													value={editingName}
													onChange={(e) => setEditingName(e.target.value)}
													onKeyDown={(e) => handleKeyDown(e, room.id)}
													placeholder="Room name..."
													autoFocus
													maxLength={50}
												/>
												<button
													className="Root-room-save"
													onClick={() => handleSaveName(room.id)}
												>
													✓
												</button>
											</div>
										) : (
											<>
												<div className="Root-room-id">
													{room.name || room.id}
													{room.name && <span className="Root-room-id-small">({room.id})</span>}
												</div>
												<div className="Root-room-date">
													Created: {formatDate(room.createdAt)}
												</div>
												{room.lastAccessedAt !== room.createdAt && (
													<div className="Root-room-accessed">
														Last accessed: {formatDate(room.lastAccessedAt)}
													</div>
												)}
											</>
										)}
									</div>
									{editingId !== room.id && (
										<div className="Root-room-actions">
											<button
												className="Root-room-edit-btn"
												onClick={(e) => handleStartEditing(e, room)}
												title="Rename room"
											>
												✏️
											</button>
											<button
												className="Root-room-export"
												onClick={(e) => handleExportRoom(e, room)}
												title="Export room"
											>
												⬇️
											</button>
											<button
												className="Root-room-delete"
												onClick={(e) => handleDeleteRoom(e, room.id)}
												title="Delete room"
											>
												🗑️
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{rooms.length === 0 && showList && (
					<div className="Root-empty">
						<p>No rooms yet. Create a new one to get started!</p>
					</div>
				)}
			</div>
		</div>
	)
}
