import { api } from '@/configs/api.config'
import type { User } from '@/@types/auth'
import { uploadFile } from '@/configs/firebase.storage'

export class UserServiceError extends Error {
    constructor(
        message: string,
        public status?: number,
        public data?: any,
        public userId?: string
    ) {
        super(message)
        this.name = 'UserServiceError'
    }
}

export const apiGetUser = async (userId: string): Promise<User> => {
    console.log('Fetching user data:', { userId })
    
    try {
        const response = await api.get(`/api/users/${userId}`)
        console.log('User data retrieved successfully:', {
            userId,
            hasData: !!response.data
        })
        return response.data
    } catch (error: any) {
        console.error('Failed to fetch user:', {
            userId,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        })
        throw new UserServiceError(
            'Failed to fetch user data',
            error.response?.status,
            error.response?.data,
            userId
        )
    }
}

export const apiUpdateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    console.log('Updating user data:', {
        userId,
        updateFields: Object.keys(userData)
    })
    
    try {
        const response = await api.put(`/api/users/${userId}`, userData)
        console.log('User data updated successfully:', {
            userId,
            updatedFields: Object.keys(userData)
        })
        return response.data
    } catch (error: any) {
        console.error('Failed to update user:', {
            userId,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        })
        throw new UserServiceError(
            'Failed to update user data',
            error.response?.status,
            error.response?.data,
            userId
        )
    }
}

export const apiUploadProfileImage = async (userId: string, file: File): Promise<{ imageUrl: string }> => {
    console.log('Uploading profile image:', {
        userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    })
    
    try {
        // Upload to Firebase Storage
        const path = `profile-images/${userId}/${file.name}`
        const imageUrl = await uploadFile(file, path)
        
        // Update user profile with new image URL using the new endpoint
        const response = await api.put(`/api/users/${userId}/profile-image`, { imageUrl })
        
        console.log('Profile image uploaded successfully:', {
            userId,
            imageUrl,
            updatedUser: response.data
        })
        
        return { imageUrl }
    } catch (error: any) {
        console.error('Failed to upload profile image:', {
            userId,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        })
        throw new UserServiceError(
            'Failed to upload profile image',
            error.response?.status,
            error.response?.data,
            userId
        )
    }
} 