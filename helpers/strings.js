const errorMessages = {
    invalidEmail: 'Por favor, ingresa un email válido',
    passwordTooShort: 'Tu contraseña debe tener al menos 8 caracteres',
    passwordHash: 'Password hash generation error',
    userAlreadyExists: (user) => `El usuario ${user} ya existe`,
    invalidCredentials: 'Email o contraseña inválidos',
    internalServerError: 'Ha ocurrido un error inesperado en el servidor',
    corsError: (origin) => `Error de CORS. Este recurso no puede ser solicitado desde ${origin}`,
}

const jwtErrors = {
    ["invalid signature"]: 'La firma del token no es válida',
    ["jwt expired"]: 'El token proporcionado ha expirado',
    ["invalid token"]: 'El token no existe o el formato del token no es válido. Autorización denegada',
    ["jwt malformed"]: 'El token no existe o el formato del token no es válido. Autorización denegada',
}

export {
    errorMessages,
    jwtErrors
}