export const purchaseProduct = async (token, userId, productId, quantity = 1) => {
    return fetch(`${import.meta.env.VITE_URL_API}/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            user_id: userId,
            product_id: productId,
            quantity: quantity,
        }),
    })
}

export const purchaseProductWifi = async (token, pin, productId) => {
    console.log(productId);
    
    return fetch(`${import.meta.env.VITE_URL_API}/purchase/wifi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            "X-PIN": pin
        },
        body: JSON.stringify({product_id: productId}),
    })
}
