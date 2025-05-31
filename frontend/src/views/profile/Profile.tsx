import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Form,
    FormItem,
    Input,
    DatePicker,
    TimeInput,
    Select,
    Button,
    Tooltip,
} from '@/components/ui'
import { useAuth } from '@/auth'
import { toast } from '@/components/ui/toast'
import PageContainer from '@/components/template/PageContainer'

const Profile = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: user?.name || '',
        password: '',
        dateOfBirth: user?.dateOfBirth || '',
        timeOfBirth: user?.timeOfBirth || '',
        locationOfBirth: user?.locationOfBirth || '',
        language: user?.language || 'en',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateUser(formData)
            toast.push(t('profile.updateSuccess'), {
                placement: 'top-center',
                transitionType: 'scale',
            })
        } catch {
            toast.push(t('profile.updateError'), {
                placement: 'top-center',
                transitionType: 'scale',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string | Date | null) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value instanceof Date ? value.toISOString() : value,
        }))
    }

    return (
        <PageContainer>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {t('profile.title')}
                </h1>
                <Form onSubmit={handleSubmit}>
                    <FormItem label={t('profile.name')}>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) =>
                                handleChange('name', e.target.value)
                            }
                        />
                    </FormItem>

                    <FormItem label={t('profile.password')}>
                        <Input
                            placeholder={t('profile.passwordPlaceholder')}
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                handleChange('password', e.target.value)
                            }
                        />
                    </FormItem>

                    <FormItem
                        label={
                            <div className="flex items-center gap-2">
                                {t('profile.dateOfBirth')}
                                <Tooltip
                                    title={t('profile.dateOfBirthTooltip')}
                                >
                                    <span className="text-gray-400 cursor-help">
                                        ⓘ
                                    </span>
                                </Tooltip>
                            </div>
                        }
                    >
                        <DatePicker
                            value={
                                formData.dateOfBirth
                                    ? new Date(formData.dateOfBirth)
                                    : null
                            }
                            onChange={(date) =>
                                handleChange('dateOfBirth', date)
                            }
                        />
                    </FormItem>

                    <FormItem
                        label={
                            <div className="flex items-center gap-2">
                                {t('profile.timeOfBirth')}
                                <Tooltip
                                    title={t('profile.timeOfBirthTooltip')}
                                >
                                    <span className="text-gray-400 cursor-help">
                                        ⓘ
                                    </span>
                                </Tooltip>
                            </div>
                        }
                    >
                        <TimeInput
                            value={
                                formData.timeOfBirth
                                    ? new Date(formData.timeOfBirth)
                                    : null
                            }
                            onChange={(time) =>
                                handleChange('timeOfBirth', time)
                            }
                        />
                    </FormItem>

                    <FormItem
                        label={
                            <div className="flex items-center gap-2">
                                {t('profile.locationOfBirth')}
                                <Tooltip
                                    title={t('profile.locationOfBirthTooltip')}
                                >
                                    <span className="text-gray-400 cursor-help">
                                        ⓘ
                                    </span>
                                </Tooltip>
                            </div>
                        }
                    >
                        <Input
                            required
                            value={formData.locationOfBirth}
                            onChange={(e) =>
                                handleChange('locationOfBirth', e.target.value)
                            }
                        />
                    </FormItem>

                    <FormItem label={t('profile.language')}>
                        <Select<{ label: string; value: string }>
                            isSearchable={false}
                            options={[
                                { label: 'English', value: 'en' },
                                { label: 'Español', value: 'es' },
                                { label: 'Français', value: 'fr' },
                            ]}
                            value={{
                                label:
                                    formData.language === 'en'
                                        ? 'English'
                                        : formData.language === 'es'
                                          ? 'Español'
                                          : 'Français',
                                value: formData.language,
                            }}
                            onChange={(lang) =>
                                handleChange('language', lang?.value ?? 'en')
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
                        <Button loading={loading} type="submit" variant="solid">
                            {t('common.save')}
                        </Button>
                    </div>
                </Form>
            </div>
        </PageContainer>
    )
}

export default Profile
