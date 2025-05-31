import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/template/PageContainer'
import { Card, Form, FormItem, Input, Button, Tabs } from '@/components/ui'

interface ContactFormData {
    name: string
    email: string
    phone: string
    message: string
}

const Help = () => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        message: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // TODO: Implement contact form submission to your backend
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
            setFormData({ name: '', email: '', phone: '', message: '' })
            // Show success message
        } catch {
            // Show error message
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof ContactFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{t('help.title')}</h1>

                <Tabs defaultValue="faq">
                    <Tabs.TabList>
                        <Tabs.TabNav value="faq">{t('help.faq')}</Tabs.TabNav>
                        <Tabs.TabNav value="contact">
                            {t('help.contact')}
                        </Tabs.TabNav>
                    </Tabs.TabList>

                    <Tabs.TabContent value="faq">
                        <Card className="mt-4">
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {t('help.faq1.question')}
                                        </h3>
                                        <p className="text-gray-600">
                                            {t('help.faq1.answer')}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {t('help.faq2.question')}
                                        </h3>
                                        <p className="text-gray-600">
                                            {t('help.faq2.answer')}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {t('help.faq3.question')}
                                        </h3>
                                        <p className="text-gray-600">
                                            {t('help.faq3.answer')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Tabs.TabContent>

                    <Tabs.TabContent value="contact">
                        <Card className="mt-4">
                            <div className="p-6">
                                <Form onSubmit={handleSubmit}>
                                    <FormItem
                                        label={t('help.contactForm.name')}
                                    >
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                handleChange(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </FormItem>

                                    <FormItem
                                        label={t('help.contactForm.email')}
                                    >
                                        <Input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleChange(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </FormItem>

                                    <FormItem
                                        label={t('help.contactForm.phone')}
                                    >
                                        <Input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                handleChange(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </FormItem>

                                    <FormItem
                                        label={t('help.contactForm.message')}
                                    >
                                        <Input
                                            required
                                            type="textarea"
                                            value={formData.message}
                                            onChange={(e) =>
                                                handleChange(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </FormItem>

                                    <div className="flex justify-end mt-6">
                                        <Button
                                            loading={loading}
                                            type="submit"
                                            variant="solid"
                                        >
                                            {t('help.contactForm.submit')}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Card>
                    </Tabs.TabContent>
                </Tabs>
            </div>
        </PageContainer>
    )
}

export default Help
