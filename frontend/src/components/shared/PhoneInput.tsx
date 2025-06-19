import { Controller } from 'react-hook-form'
import FormItem from '@/components/ui/Form/FormItem'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import type { Control, FieldErrors } from 'react-hook-form'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import type { GroupBase, ControlProps, OptionProps } from 'react-select'
import { useMemo } from 'react'

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

type PhoneInputProps = {
    control: Control<any>
    errors: FieldErrors<any>
    placeholder?: string
}

const CustomControl = (props: any) => {
    const selected = props.getValue()[0]
    const { children, ...rest } = props
    return (
        <components.Control {...rest}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </components.Control>
    )
}

const CustomSelectOption = (props: any) => {
    return (
        <DefaultOption
            {...props}
            customLabel={(data: any, label: any) => (
                <span className="flex items-center gap-2">
                    <Avatar
                        shape="circle"
                        size={20}
                        src={`/img/countries/${data.value}.png`}
                    />
                    {props.variant === 'country' && <span>{label}</span>}
                    {props.variant === 'phone' && <span>{data.dialCode}</span>}
                </span>
            )}
        />
    )
}

const PhoneInput = ({ control, errors, placeholder }: PhoneInputProps) => {
    const dialCodeList = useMemo(() => {
        const newCountryList: Array<CountryOption> = JSON.parse(
            JSON.stringify(countryList),
        )

        return newCountryList.map((country) => {
            country.label = country.dialCode
            return country
        })
    }, [])

    return (
        <div className="flex items-end gap-4 w-full mb-6">
            <FormItem
                invalid={Boolean(errors.dialCode)}
                errorMessage={errors.dialCode?.message?.toString()}
            >
                <Controller
                    name="dialCode"
                    control={control}
                    render={({ field }) => (
                        <Select
                            options={dialCodeList}
                            {...field}
                            className="w-[150px]"
                            components={{
                                Option: (props: any) => (
                                    <CustomSelectOption
                                        variant="phone"
                                        {...props}
                                    />
                                ),
                                Control: CustomControl,
                            }}
                            placeholder=""
                            value={dialCodeList.filter(
                                (option) => option.dialCode === field.value,
                            )}
                            onChange={(option: any) =>
                                field.onChange(option?.dialCode)
                            }
                        />
                    )}
                />
            </FormItem>
            <FormItem
                className="w-full"
                invalid={Boolean(errors.phoneNumber)}
                errorMessage={errors.phoneNumber?.message?.toString()}
            >
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            autoComplete="off"
                            placeholder={
                                placeholder || 'Enter your phone number'
                            }
                            {...field}
                        />
                    )}
                />
            </FormItem>
        </div>
    )
}

export default PhoneInput
