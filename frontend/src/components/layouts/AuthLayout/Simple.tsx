import { cloneElement, ReactElement, ReactNode } from 'react'
import Container from '@/components/shared/Container'
import type { CommonProps } from '@/@types/common'
import LanguageSelector from '@/components/template/LanguageSelector'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="min-h-screen h-full bg-white dark:bg-gray-800 relative overflow-y-auto">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSelector />
            </div>
            <Container className="flex flex-col flex-auto items-center justify-center min-w-0 h-full px-4 md:px-8">
                <div className="min-w-[90vw] xs:min-w-[260px] md:min-w-[400px] max-w-[400px] w-full">
                    <div>
                        {content}
                        {children
                            ? cloneElement(children as ReactElement, {
                                  ...rest,
                              })
                            : null}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Simple
