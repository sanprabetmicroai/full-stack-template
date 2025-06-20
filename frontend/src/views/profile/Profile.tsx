import React, { useState, useRef } from 'react'
import { Card, Form, FormItem, Input, Button } from '@/components/ui'
import { useAuth } from '@/auth'
import { useTranslation } from 'react-i18next'
import { FaCamera } from 'react-icons/fa'
import dayjs from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    apiGetUser,
    apiUpdateUser,
    apiUploadProfileImage,
} from '@/services/UserService'
import { toast } from 'react-toastify'
import type { User } from '@/@types/auth'
import UpdateContactModal from '@/components/shared/UpdateContactModal'

const MAX_FILE_SIZE_MB = 2
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

const Profile = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [showPhoneModal, setShowPhoneModal] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Add console log for auth user
    console.log('Auth User:', user)

    // Fetch user data with React Query
    const { data: userData, isLoading } = useQuery<User>({
        queryKey: ['user', user?.id],
        queryFn: () => apiGetUser(user?.id || ''),
        enabled: !!user?.id,
    })

    // Add console log for fetched user data
    console.log('Fetched User Data:', userData)

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: (userData: Partial<User>) =>
            apiUpdateUser(user?.id || '', userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', user?.id] })
            toast.success(t('profile.updateSuccess'))
        },
        onError: (error) => {
            toast.error(t('profile.updateError'))
            console.error('Error updating profile:', error)
        },
    })

    // Upload profile image mutation
    const uploadImageMutation = useMutation({
        mutationFn: (file: File) => apiUploadProfileImage(user?.id || '', file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', user?.id] })
            toast.success(t('profile.imageUpdateSuccess'))
        },
        onError: (error) => {
            toast.error(t('profile.imageUpdateError'))
            console.error('Error uploading profile picture:', error)
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
        ? dayjs(new Date(userData.createdAt._seconds * 1000)).format(
              'MMMM D, YYYY',
          )
        : ''

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setErrorMsg(null)
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            const result = await uploadImageMutation.mutateAsync(file)
            console.log('Image upload result:', result)
        } catch (error: any) {
            console.error('Error uploading profile picture:', error)
            setErrorMsg(error.message || 'Failed to upload profile picture')
        } finally {
            setIsUploading(false)
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateUserMutation.mutateAsync({
                firstName: formData.firstName,
                lastName: formData.lastName,
            })
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
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
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 w-full">
                                <div className="flex flex-col items-center w-full md:w-auto">
                                    <div className="relative group w-24 h-24 sm:w-32 sm:h-32 mb-4">
                                        <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 transition-all duration-200 cursor-pointer">
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
                                                    className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500"
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
                                        className="w-full sm:w-auto"
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
                                <div className="flex-1 w-full">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                {formData.firstName}{' '}
                                                {formData.lastName}
                                            </h3>
                                            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1 flex-wrap break-all">
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
                                            <div className="flex items-center text-gray-600 dark:text-gray-300 flex-wrap break-all">
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
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center text-gray-600 dark:text-gray-300">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                            {/* Email Update Section */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6 w-full">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                    {t('profile.emailSettings')}
                                </h3>
                                <div className="w-full">
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
                                            {t('profile.email')}
                                            {userData?.email && (
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        userData.email_verified ===
                                                        true
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}
                                                >
                                                    {userData.email_verified ===
                                                    true
                                                        ? t('profile.verified')
                                                        : t(
                                                              'profile.notVerified',
                                                          )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded px-4 py-2 text-gray-600 dark:text-gray-300">
                                            {formData.email}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="solid"
                                            onClick={() =>
                                                setShowEmailModal(true)
                                            }
                                            className=""
                                        >
                                            {t('common.updateEmail')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Update Section */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6 w-full">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                    {t('profile.phoneSettings')}
                                </h3>
                                <div className="w-full">
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
                                            {t('profile.phone')}
                                            {userData?.phoneNumber && (
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        userData.phone_verified ===
                                                        true
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    }`}
                                                >
                                                    {userData.phone_verified ===
                                                    true
                                                        ? t('profile.verified')
                                                        : t(
                                                              'profile.notVerified',
                                                          )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded px-4 py-2 text-gray-600 dark:text-gray-300">
                                            {formData.phoneNumber ||
                                                t('profile.noPhone')}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="solid"
                                            onClick={() =>
                                                setShowPhoneModal(true)
                                            }
                                            className=""
                                        >
                                            {t('common.updatePhone')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6 w-full">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                {t('profile.personalInfo')}
                            </h3>
                            {isEditing ? (
                                <Form
                                    onSubmit={handlePersonalInfoSubmit}
                                    className="w-full"
                                >
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
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 w-full">
                                        <Button
                                            variant="plain"
                                            onClick={() => setIsEditing(false)}
                                            className="w-full sm:w-auto"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            variant="solid"
                                            type="submit"
                                            className="w-full sm:w-auto"
                                        >
                                            {t('common.save')}
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="w-full">
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                            {t('profile.firstName')}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded px-4 py-2 text-gray-600 dark:text-gray-300">
                                            {formData.firstName}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                            {t('profile.lastName')}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded px-4 py-2 text-gray-600 dark:text-gray-300">
                                            {formData.lastName}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            variant="solid"
                                            onClick={() => setIsEditing(true)}
                                            className="w-full sm:w-auto"
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

            {/* Contact Update Modals */}
            <UpdateContactModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                type="email"
                currentValue={formData.email}
                userId={user?.id || ''}
            />
            <UpdateContactModal
                isOpen={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
                type="phone"
                currentValue={formData.phoneNumber}
                userId={user?.id || ''}
            />
        </div>
    )
}

export default Profile
