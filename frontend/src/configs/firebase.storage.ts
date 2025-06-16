import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import FirebaseConfig from './firebase.config'

// Initialize Firebase
const app = initializeApp(FirebaseConfig)
const storage = getStorage(app)

// Upload file to Firebase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return downloadURL
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}

// Delete file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path)
        await deleteObject(storageRef)
    } catch (error) {
        console.error('Error deleting file:', error)
        throw error
    }
}

// Get download URL for a file
export const getFileURL = async (path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path)
        return await getDownloadURL(storageRef)
    } catch (error) {
        console.error('Error getting file URL:', error)
        throw error
    }
}

export default storage
