export const getProducts = async (token) => {
    return fetch(`${import.meta.env.VITE_URL_API}/products/active`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}
