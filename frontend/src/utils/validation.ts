export const validatePhoneNumber = (phoneNumber: string): boolean => {
    // Basic phone number validation (can be customized based on requirements)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber)
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validateOTP = (otp: string): boolean => {
    // OTP should be 6 digits
    const otpRegex = /^\d{6}$/
    return otpRegex.test(otp)
}

export const validateName = (name: string): boolean => {
    // Name should be at least 2 characters and only contain letters and spaces
    const nameRegex = /^[a-zA-Z\s]{2,}$/
    return nameRegex.test(name)
}
