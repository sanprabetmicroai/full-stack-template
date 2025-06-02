import { useState, useRef } from 'react'
import { Card, Form, FormItem, Input, Button } from '@/components/ui'
import { useAuth } from '@/auth'
import { useTranslation } from 'react-i18next'
import { uploadFile } from '@/configs/firebase.storage'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import React from 'react'
import { FaCamera } from 'react-icons/fa'

const MAX_FILE_SIZE_MB = 2
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

const Profile = () => {
    const { t } = useTranslation()
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [profileImage, setProfileImage] = useState<string | undefined>(
        user?.profileImage,
    )
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    })
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setErrorMsg(null)
        const file = e.target.files?.[0]
        if (!file) return

        // File size check
        if (file.size > MAX_FILE_SIZE) {
            setErrorMsg(`File size must be less than ${MAX_FILE_SIZE_MB}MB.`)
            return
        }

        // Aspect ratio check
        const img = new window.Image()
        img.src = URL.createObjectURL(file)
        img.onload = async () => {
            if (img.width !== img.height) {
                setErrorMsg('Image must be square (1:1 ratio).')
                return
            }
            try {
                setIsUploading(true)
                const path = `ProfilePics/${user?.id}/${file.name}`
                const downloadURL = await uploadFile(file, path)
                setProfileImage(downloadURL)
                await updateUser({ ...formData, profileImage: downloadURL })
            } catch (error) {
                setErrorMsg('Error uploading profile picture.')
                console.error('Error uploading profile picture:', error)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateUser({ ...formData, profileImage })
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    const handleEditClick = () => {
        console.log('Edit button clicked')
        setIsEditing(true)
    }

    // Log whenever isEditing changes
    React.useEffect(() => {
        console.log('isEditing state:', isEditing)
    }, [isEditing])

    return (
        <div className="container mx-auto p-4">
            <Card
                header={{
                    content: t('profile.title'),
                }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative group w-32 h-32">
                            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200 group-hover:border-blue-400 transition-all duration-200 cursor-pointer">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-16 h-16 text-gray-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z"
                                        />
                                    </svg>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaCamera className="text-white text-2xl" />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        className="absolute top-1/2 right-[-90px] -translate-y-1/2"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploading}
                                    >
                                        {isUploading
                                            ? t('common.uploading')
                                            : t('common.upload')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {isEditing && (
                        <div className="text-xs text-gray-500 text-center mb-2">
                            Allowed: 1:1 ratio, max {MAX_FILE_SIZE_MB}MB, image
                            files only.
                        </div>
                    )}
                    {errorMsg && (
                        <div className="text-xs text-red-500 text-center mb-2">
                            {errorMsg}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <Form onSubmit={handleSubmit}>
                        <FormItem label={t('profile.firstName')}>
                            <Input
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label={t('profile.lastName')}>
                            <Input
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <FormItem label={t('profile.email')}>
                            <Input
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </FormItem>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="plain"
                                onClick={() => setIsEditing(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button variant="solid" type="submit">
                                {t('common.save')}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div className="w-full">
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">
                                {t('profile.firstName')}
                            </div>
                            <div className="bg-gray-50 rounded px-4 py-2">
                                {formData.firstName}
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">
                                {t('profile.lastName')}
                            </div>
                            <div className="bg-gray-50 rounded px-4 py-2">
                                {formData.lastName}
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">
                                {t('profile.email')}
                            </div>
                            <div className="bg-gray-50 rounded px-4 py-2">
                                {formData.email}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="solid" onClick={handleEditClick}>
                                {t('common.edit')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Profile
