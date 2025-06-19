import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { HiStar } from 'react-icons/hi'

interface SignOutModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (rating: number, feedback: string) => void
}

const SignOutModal = ({ isOpen, onClose, onConfirm }: SignOutModalProps) => {
    const { t } = useTranslation()
    const [rating, setRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (feedback.length < 8) {
            setError(t('signOut.feedbackMinLength'))
            return
        }
        onConfirm(rating, feedback)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} contentClassName="pb-0 px-0">
            <div className="px-6 pb-6 pt-2">
                <h5 className="mb-4">{t('signOut.title')}</h5>
                <div className="mb-4">
                    <label className="block mb-2">{t('signOut.rating')}</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-2xl ${
                                    star <= rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            >
                                <HiStar />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-2">
                        {t('signOut.feedback')}
                    </label>
                    <Input
                        type="textarea"
                        value={feedback}
                        onChange={(e) => {
                            setFeedback(e.target.value)
                            setError('')
                        }}
                        placeholder={t('signOut.feedbackPlaceholder')}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>
            </div>
            <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-bl-2xl rounded-br-2xl">
                <div className="flex justify-end items-center gap-2">
                    <Button size="sm" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button size="sm" variant="solid" onClick={handleConfirm}>
                        {t('common.confirm')}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default SignOutModal
