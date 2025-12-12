export const getPurchaseHistory = async (token, userId) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchases/user/${userId}/details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}
