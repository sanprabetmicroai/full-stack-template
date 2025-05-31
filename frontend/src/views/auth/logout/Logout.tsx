import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth'
import PageContainer from '@/components/template/PageContainer'
import { Card, Form, FormItem, Input, Button, Select } from '@/components/ui'

interface FeedbackFormData {
    rating: number
    comments: string
}

type RatingOption = {
    label: string
    value: number
}

const Logout = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FeedbackFormData>({
        rating: 0,
        comments: '',
    })

    const ratingOptions: RatingOption[] = [
        { label: '⭐⭐⭐⭐⭐', value: 5 },
        { label: '⭐⭐⭐⭐', value: 4 },
        { label: '⭐⭐⭐', value: 3 },
        { label: '⭐⭐', value: 2 },
        { label: '⭐', value: 1 },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // TODO: Implement feedback submission to your backend
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
            await signOut()
            navigate('/login')
        } catch {
            // Show error message
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (
        field: keyof FeedbackFormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <PageContainer>
            <div className="max-w-md mx-auto p-6">
                <Card>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-6">
                            {t('logout.title')}
                        </h1>

                        <Form onSubmit={handleSubmit}>
                            <FormItem label={t('logout.feedback.rating')}>
                                <Select<RatingOption>
                                    required
                                    options={ratingOptions}
                                    value={ratingOptions.find(
                                        (opt) => opt.value === formData.rating,
                                    )}
                                    onChange={(option) =>
                                        handleChange(
                                            'rating',
                                            option?.value ?? 0,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem label={t('logout.feedback.comments')}>
                                <Input
                                    placeholder={t(
                                        'logout.feedback.commentsPlaceholder',
                                    )}
                                    type="textarea"
                                    value={formData.comments}
                                    onChange={(e) =>
                                        handleChange('comments', e.target.value)
                                    }
                                />
                            </FormItem>

                            <div className="flex justify-end gap-4 mt-6">
                                <Button
                                    variant="plain"
                                    onClick={() => navigate('/main')}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    loading={loading}
                                    type="submit"
                                    variant="solid"
                                >
                                    {t('logout.confirm')}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Card>
            </div>
        </PageContainer>
    )
}

export default Logout
