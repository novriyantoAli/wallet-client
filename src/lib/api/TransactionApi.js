export const getRecentTransactions = async (token, walletId) => {
    return fetch(`${import.meta.env.VITE_URL_API}/transactions?page_size=3&wallet_id=${walletId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}