export function authError(): Error {
    return Object.assign(new Error("Unauthorized"), { status: 401 })
}

export function validationError(message: string): Error {
    return Object.assign(new Error(message), { status: 400 })
}

export function notFoundError(message: string): Error {
    return Object.assign(new Error(message), { status: 404 })
}