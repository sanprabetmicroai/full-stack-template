import React, { useState, useRef } from 'react'
import { Card, Form, FormItem, Input, Button } from '@/components/ui'
import { useAuth } from '@/auth'
import { useTranslation } from 'react-i18next'
import { uploadFile } from '@/configs/firebase.storage'
import { FaCamera } from 'react-icons/fa'
import dayjs from 'dayjs'
import { apiGetCurrentUser } from '@/services/ProfileService'
import { useQuery } from '@tanstack/react-query'

const MAX_FILE_SIZE_MB = 2
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

interface Timestamp {
    _seconds: number
    _nanoseconds: number
}

const Profile = () => {
    const { t } = useTranslation()
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isEditingEmail, setIsEditingEmail] = useState(false)
    const [isEditingPhone, setIsEditingPhone] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Use React Query to fetch user data
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiGetCurrentUser()
            if (!response.success) {
                throw new Error('Failed to fetch user data')
            }
            return response.data
        },
    })

    // Update form data when user data is fetched
    const [formData, setFormData] = useState({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
    })

    // Update form data when userData changes
    React.useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
            })
        }
    }, [userData])

    // Format creation date
    const formattedDate = userData?.createdAt
        ? dayjs(
              (userData.createdAt as unknown as Timestamp)._seconds * 1000,
          ).format('MMMM D, YYYY')
        : ''

    // Log user object
    console.log('User object:', user)

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
                const fileExtension = file.name.split('.').pop()
                const path = `ProfilePics/${user?.id}.${fileExtension}`
                const downloadURL = await uploadFile(file, path)
                await updateUser({
                    profileImage: downloadURL,
                })
            } catch (error) {
                setErrorMsg('Error uploading profile picture.')
                console.error('Error uploading profile picture:', error)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateUser(formData)
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    const handleEditClick = () => {
        console.log('Edit button clicked')
        setIsEditing(true)
    }

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateUser({ email: formData.email })
            setIsEditingEmail(false)
        } catch (error) {
            console.error('Error updating email:', error)
        }
    }

    const handlePhoneUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateUser({ phoneNumber: formData.phoneNumber })
            setIsEditingPhone(false)
        } catch (error) {
            console.error('Error updating phone:', error)
        }
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
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {/* Profile Picture Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <div className="flex items-start gap-8">
                                <div className="flex flex-col items-center">
                                    <div className="relative group w-32 h-32 mb-4">
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200 group-hover:border-blue-400 transition-all duration-200 cursor-pointer">
                                            {userData?.profileImage ? (
                                                <img
                                                    src={userData.profileImage}
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
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaCamera className="text-white text-2xl" />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploading}
                                    >
                                        {isUploading
                                            ? t('common.uploading')
                                            : t('profile.uploadPicture')}
                                    </Button>
                                    {errorMsg && (
                                        <div className="text-xs text-red-500 mt-2">
                                            {errorMsg}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                {formData.firstName}{' '}
                                                {formData.lastName}
                                            </h3>
                                            <div className="flex items-center text-gray-600 mb-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {formData.email}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                {formData.phoneNumber}
                                            </div>
                                        </div>
                                        {formattedDate && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex items-center text-gray-600">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    {t('profile.memberSince')}:{' '}
                                                    {formattedDate}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Email Update Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                    {t('profile.emailSettings')}
                                </h3>
                                {isEditingEmail ? (
                                    <Form onSubmit={handleEmailUpdate}>
                                        <FormItem label={t('profile.email')}>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button
                                                variant="plain"
                                                onClick={() =>
                                                    setIsEditingEmail(false)
                                                }
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                            <Button
                                                variant="solid"
                                                type="submit"
                                                className=""
                                            >
                                                {t('common.update')}
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <div className="w-full">
                                        <div className="mb-4">
                                            <div className="font-semibold text-gray-700 mb-1">
                                                {t('profile.email')}
                                            </div>
                                            <div className="bg-gray-50 rounded px-4 py-2 text-gray-600">
                                                {formData.email}
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="solid"
                                                onClick={() =>
                                                    setIsEditingEmail(true)
                                                }
                                                className=""
                                            >
                                                {t('common.updateEmail')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Phone Update Section */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                    {t('profile.phoneSettings')}
                                </h3>
                                {isEditingPhone ? (
                                    <Form onSubmit={handlePhoneUpdate}>
                                        <FormItem label={t('profile.phone')}>
                                            <Input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        phoneNumber:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </FormItem>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button
                                                variant="plain"
                                                onClick={() =>
                                                    setIsEditingPhone(false)
                                                }
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                            <Button
                                                variant="solid"
                                                type="submit"
                                                className=""
                                            >
                                                {t('common.update')}
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <div className="w-full">
                                        <div className="mb-4">
                                            <div className="font-semibold text-gray-700 mb-1">
                                                {t('profile.phone')}
                                            </div>
                                            <div className="bg-gray-50 rounded px-4 py-2 text-gray-600">
                                                {formData.phoneNumber ||
                                                    t('profile.noPhone')}
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                variant="solid"
                                                onClick={() =>
                                                    setIsEditingPhone(true)
                                                }
                                                className=""
                                            >
                                                {t('common.updatePhone')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                {t('profile.personalInfo')}
                            </h3>
                            {isEditing ? (
                                <Form onSubmit={handlePersonalInfoSubmit}>
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
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button
                                            variant="plain"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            variant="solid"
                                            type="submit"
                                            className=""
                                        >
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
                                        <div className="bg-gray-50 rounded px-4 py-2 text-gray-600">
                                            {formData.firstName}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-700 mb-1">
                                            {t('profile.lastName')}
                                        </div>
                                        <div className="bg-gray-50 rounded px-4 py-2 text-gray-600">
                                            {formData.lastName}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="solid"
                                            onClick={handleEditClick}
                                            className=""
                                        >
                                            {t('profile.updateInfo')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}

export default Profile
