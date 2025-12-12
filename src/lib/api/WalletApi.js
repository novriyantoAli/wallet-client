export const getWallet = async (token, id) => {
    return fetch(`${import.meta.env.VITE_URL_API}/users/${id}/wallet`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const getRecentTransactions = async (token, walletId) => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets/transactions?wallet_id=${walletId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
}

export const walletTransferFund = async (token, recipientId, amount, description = '') => {
    return fetch(`${import.meta.env.VITE_URL_API}/wallets/transfer-to-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            recipient_user_id: recipientId,
            amount: amount,
            description: description,
        }),
    })
}
