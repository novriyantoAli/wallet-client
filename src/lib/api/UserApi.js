export const userRegister = async ({name, password, email}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({name, password, email})
    })
}

export const userLogin = async ({email, password}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/auth/login`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify({email, password}),
    });
}

export const userGetLevelUsers = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users?level=user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}
export const userDetail = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const userUpdateName = async (token, id, {name}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({name}),
    });
}

export const userUpdatePassword = async (token, id, {current_password, new_password}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/users/${id}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({current_password, new_password}),
    });
}

export const userSecurityCheck = async (token, userId) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/user-security?user_id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
}

export const userLogout = async (token) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/auth/logout`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
}

export const userSetupPin = async (token, userId, {pin}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/user-security/pin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            user_id: parseInt(userId, 10), 
            pin: pin
        }),
    });
}

export const userUpdatePin = async (token, userId, {current_pin, new_pin}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/users/${userId}/pin`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({current_pin, new_pin}),
    });
}