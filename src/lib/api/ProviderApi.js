export async function getProviders(token) {
    const response = await fetch(`${import.meta.env.VITE_URL_API}/providers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response;
}

export async function getProviderById(token, providerId) {
    const response = await fetch(`${import.meta.env.VITE_URL_API}/providers/${providerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response;
}
