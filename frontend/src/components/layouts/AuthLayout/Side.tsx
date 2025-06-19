import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import LanguageSelector from '@/components/template/LanguageSelector'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex h-full p-6 bg-white dark:bg-gray-800">
            <div className=" flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden rounded-3xl items-end relative xl:max-w-[520px] 2xl:max-w-[720px]">
                <div className="absolute h-full w-full top-0 left-0 rounded-3xl bg-gray-200 dark:bg-gray-700" />
                <div className="relative z-10">
                    <LanguageSelector />
                </div>
            </div>
        </div>
    )
}

export default Side
