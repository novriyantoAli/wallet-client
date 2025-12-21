export const authSignIn = async ({provider, redirect_uri}) => {
    console.log('provider: ', provider);
    console.log('redirect_uri: ', redirect_uri);
    
    
    return await fetch(`${import.meta.env.VITE_URL_API}/oauth/authorization-url`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify({provider, redirect_uri}),
    });
}

export const authAction = async ({provider, code, state}) => {
    return await fetch(`${import.meta.env.VITE_URL_API}/oauth/authenticate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({provider: 'google', code: code, state: state }),
    });
}

export const authMe = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/oauth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}