export const getTransfers = async (token, userId) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${userId}/transfers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getTransferDetail = async (token, transferId) => {
    return fetch(`${import.meta.env.VITE_URL_API}/transfers/${transferId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}
