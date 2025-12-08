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