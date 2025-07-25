import { cloneElement, ReactElement, ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'
import LanguageSelector from '@/components/template/LanguageSelector'

interface SplitProps extends CommonProps {
    content?: ReactNode
}

const Split = ({ children, content, ...rest }: SplitProps) => {
    return (
        <div className="grid lg:grid-cols-2 h-full p-6 bg-white dark:bg-gray-800 relative">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSelector />
            </div>
            <div className="bg-no-repeat bg-cover py-6 px-16 flex-col justify-center items-center hidden lg:flex bg-primary rounded-3xl">
                <div className="flex flex-col items-center gap-12">
                    <div className="w-full max-w-[450px] 2xl:max-w-[900px] h-[300px] bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="text-center max-w-[550px]">
                        <h1 className="text-neutral">
                            The easiest way to build your admin app
                        </h1>
                        <p className="text-neutral opacity-80 mx-auto mt-8 font-semibold">
                            Experience seamless project management with Kars.
                            Simplify your workflow, and achieve your goals
                            efficiently with our powerful and intuitive tools.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center ">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    <div className="mb-8">{content}</div>
                    {children
                        ? cloneElement(children as ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Split
