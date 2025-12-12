<script>
    import { alertError, alertSuccess } from "$lib/alert";
    import { getPurchaseHistory } from "$lib/api/PurchaseHistoryApi";
    import { purchaseProduct } from "$lib/api/PurchaseApi";
    import { onMount } from "svelte";
    import Swal from "sweetalert2";

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    let purchaseHistory = $state([]);
    let loading = $state(true);

    async function fetchPurchaseHistory() {
        try {
            loading = true;
            const response = await getPurchaseHistory(token, user.id);
            const responseBody = await response.json();

            console.log(responseBody);
            

            if (response.status === 200) {
                purchaseHistory = responseBody.data || [];
            } else {
                throw new Error(responseBody.error || "Failed to fetch purchase history");
            }
        } catch (error) {
            await alertError(error.message);
        } finally {
            loading = false;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    }

    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    }

    async function handleBuyAgain(purchase) {
        const product = purchase.product || {
            id: purchase.product?.id,
            name: purchase.product?.name || 'Product',
            description: purchase.product?.name || '',
            price: purchase.product?.price || purchase.total_price || 0,
        };

        // Show purchase confirmation dialog
        const { value: confirmed } = await Swal.fire({
            title: 'Confirm Purchase',
            html: `
                <div class="text-left max-w-sm mx-auto px-2 sm:px-4">
                    <div class="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>Account Name:</strong></p>
                        <p class="text-base sm:text-lg font-semibold text-gray-800 break-words">${user.name || 'N/A'}</p>
                    </div>
                    <div class="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>Package:</strong></p>
                        <p class="text-base sm:text-lg font-semibold text-gray-800 break-words">${product.name}</p>
                    </div>
                    <div class="mb-2 sm:mb-4">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>Total Purchase:</strong></p>
                        <p class="text-xl sm:text-2xl font-bold text-blue-600">${formatCurrency(product.price)}</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirm Purchase',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            didOpen: (modal) => {
                const htmlElement = modal.querySelector('.swal2-html-container');
                if (htmlElement) {
                    htmlElement.style.maxWidth = '100%';
                    htmlElement.style.overflow = 'visible';
                }
                modal.style.maxWidth = '90vw';
            }
        });

        if (confirmed) {
            try {
                const response = await purchaseProduct(token, user.id, product.id, 1);
                const responseBody = await response.json();

                if (response.status === 200 || response.status === 201) {
                    await alertSuccess(`Purchase of ${product.name} successful!`);
                    await fetchPurchaseHistory();
                } else {
                    throw new Error(responseBody.error || "Purchase failed");
                }
            } catch (error) {
                await alertError(error.message);
            }
        }
    }

    function getStatusColor(status) {
        if (status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'success') {
            return 'bg-green-500 bg-opacity-20 text-green-400';
        } else if (status?.toLowerCase() === 'pending') {
            return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
        } else if (status?.toLowerCase() === 'failed' || status?.toLowerCase() === 'cancelled') {
            return 'bg-red-500 bg-opacity-20 text-red-400';
        }
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
    }

    onMount(async () => {
        await fetchPurchaseHistory();
    })
</script>

<div class="space-y-4 sm:space-y-6 md:space-y-8">
    <!-- Header -->
    <div class="flex items-center mb-4 sm:mb-6 md:mb-8">
        <i class="fas fa-receipt text-blue-400 text-xl sm:text-2xl mr-2 sm:mr-3"></i>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Purchase History</h1>
    </div>

    <!-- Purchase History Section -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6">
            <div class="flex items-center justify-between mb-6 sm:mb-8">
                <h2 class="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                    <i class="fas fa-shopping-bag text-blue-400 text-base sm:text-lg"></i>
                    All Purchases
                </h2>
                <button 
                    onclick={fetchPurchaseHistory}
                    title="Refresh purchase history"
                    class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fas fa-sync-alt text-sm"></i>
                </button>
            </div>

            {#if loading}
                <div class="flex justify-center items-center py-12">
                    <div class="animate-spin">
                        <i class="fas fa-spinner text-blue-400 text-3xl"></i>
                    </div>
                </div>
            {:else if purchaseHistory.length === 0}
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-gray-500 text-4xl mb-4"></i>
                    <p class="text-gray-400 text-sm">No purchase history yet</p>
                </div>
            {:else}
                <!-- Desktop Table View -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-600 bg-gray-700 bg-opacity-50">
                                <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-300">Product</th>
                                <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-300">SKU</th>
                                <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-300">Price</th>
                                <th class="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-300">Qty</th>
                                <th class="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-300">Total</th>
                                <th class="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-300">Status</th>
                                <th class="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-300">Date</th>
                                <th class="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each purchaseHistory as purchase (purchase.id)}
                                <tr class="border-b border-gray-600 hover:bg-gray-700 hover:bg-opacity-30 transition-colors duration-200">
                                    <td class="px-4 py-3 text-xs sm:text-sm text-white">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                                                <i class="fas fa-box text-white text-xs"></i>
                                            </div>
                                            <span>{purchase.product?.name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-gray-300">{purchase.product?.sku || '-'}</td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-blue-400 font-medium">
                                        {formatCurrency(purchase.product?.price || 0)}
                                    </td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-gray-300 text-center">{purchase.quantity}</td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-blue-400 font-semibold text-right">
                                        {formatCurrency(purchase.total_price)}
                                    </td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-center">
                                        <span class="px-2 py-1 rounded-full text-xs font-semibold {getStatusColor(purchase.status)}">
                                            {purchase.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-xs sm:text-sm text-gray-400">
                                        {formatDate(purchase.created_at)}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <button 
                                            onclick={() => handleBuyAgain(purchase)}
                                            class="bg-gradient rounded px-3 py-1 text-white text-xs font-semibold hover:opacity-90 transition-all duration-200 shadow-md cursor-pointer">
                                            <i class="fas fa-redo mr-1"></i> Buy
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Card View -->
                <div class="md:hidden space-y-2 sm:space-y-3 max-h-screen overflow-y-auto">
                    {#each purchaseHistory as purchase (purchase.id)}
                        <div class="flex flex-col p-3 sm:p-4 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 gap-3 hover:bg-opacity-70 transition-all duration-200">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-center space-x-3 flex-1 min-w-0">
                                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <i class="fas fa-shopping-bag text-white text-sm"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-white font-medium text-sm truncate">{purchase.product?.name || 'Product'}</p>
                                        <p class="text-gray-400 text-xs">{purchase.product?.sku || '-'}</p>
                                    </div>
                                </div>
                                <span class="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 {getStatusColor(purchase.status)}">
                                    {purchase.status || 'Unknown'}
                                </span>
                            </div>
                            <div class="flex items-center justify-between text-xs sm:text-sm text-gray-300">
                                <span>Qty: <strong class="text-white">{purchase.quantity}</strong></span>
                                <span>Unit: <strong class="text-blue-400">{formatCurrency(purchase.product?.price || 0)}</strong></span>
                            </div>
                            <div class="flex items-center justify-between border-t border-gray-600 pt-3">
                                <div>
                                    <p class="text-xs text-gray-400 mb-1">{formatDate(purchase.created_at)}</p>
                                    <p class="text-sm text-blue-400 font-semibold">Total: {formatCurrency(purchase.total_price)}</p>
                                </div>
                                <button 
                                    onclick={() => handleBuyAgain(purchase)}
                                    class="bg-gradient rounded py-1 px-3 text-white text-xs font-semibold hover:opacity-90 transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap">
                                    <i class="fas fa-redo mr-1"></i> Buy
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
