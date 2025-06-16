import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    imgClass?: string
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    const height = type === 'streamline' ? '40px' : '50px'

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <div
                className={classNames(
                    'bg-gray-200 dark:bg-gray-700 rounded-md',
                    imgClass,
                )}
                style={{
                    height,
                    width: type === 'streamline' ? '40px' : '150px',
                }}
                aria-label={`${APP_NAME} logo placeholder`}
            />
        </div>
    )
}

export default Logo
