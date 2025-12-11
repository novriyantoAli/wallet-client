<script>
    import { alertError, alertSuccess } from "$lib/alert";
    import { getWallet, getRecentTransactions } from "$lib/api/WalletApi";
    import { getProducts } from "$lib/api/ProductApi";
    import { onMount } from "svelte";
    import Swal from "sweetalert2";

    const userData = JSON.parse(localStorage.getItem('userData'));

    let wallet = $state({
        id: 0,
        balance: 0,
        currency: 'IDR',
        updated_at: new Date(),
    });

    let trxData = $derived.by( async () => {
        let transactions = [];
        if (wallet.id != 0) {
            // fetch to the api
            const response = await getRecentTransactions(userData.token, wallet.id);
            const responseBody = await response.json();

            console.log(responseBody);
            
            if (response.status === 200) {
                transactions = responseBody.data;
            }
        }
        
        return transactions;
    });

    let products = $state([]);
    let loading = $state(true);
    let selectedProduct = $state(null);

    async function fetchBalance() {
        try {
            const response = await getWallet(userData.token, userData.id);
            const responseBody = await response.json();

            // console.log(responseBody);
            
            if (response.status === 200) {
                wallet = responseBody;
            } else {
                throw new Error(responseBody.error || "Failed to fetch balance");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function fetchProducts() {
        try {
            const response = await getProducts(userData.token);
            const responseBody = await response.json();

            if (response.status === 200) {
                products = responseBody.data || [];
            } else {
                throw new Error(responseBody.error || "Failed to fetch products");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function handleBuyProduct(product) {
        selectedProduct = product;
        
        // Show purchase confirmation dialog
        const { value: confirmed } = await Swal.fire({
            title: 'Confirm Purchase',
            html: `
                <div class="text-left">
                    <div class="mb-4 pb-4 border-b border-gray-300">
                        <p class="text-sm text-gray-600 mb-2"><strong>Account Name:</strong></p>
                        <p class="text-lg font-semibold text-gray-800">${userData.name || 'N/A'}</p>
                    </div>
                    <div class="mb-4 pb-4 border-b border-gray-300">
                        <p class="text-sm text-gray-600 mb-2"><strong>Package:</strong></p>
                        <p class="text-lg font-semibold text-gray-800">${product.name}</p>
                        <p class="text-sm text-gray-600 mt-1">${product.description}</p>
                    </div>
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-2"><strong>Total Purchase:</strong></p>
                        <p class="text-2xl font-bold text-blue-600">${formatCurrency(product.price)}</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirm Purchase',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (confirmed) {
            // Process the purchase
            await alertSuccess(`Purchase of ${product.name} confirmed! Processing...`);
            // You can add actual API call here
            selectedProduct = null;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: wallet.currency || 'USD',
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

    function getTransactionIcon(type) {
        if (type?.toLowerCase() === 'income' || type?.toLowerCase() === 'deposit') {
            return 'fa-arrow-down text-green-400';
        }
        return 'fa-arrow-up text-red-400';
    }

    function getTransactionColor(type) {
        if (type?.toLowerCase() === 'income' || type?.toLowerCase() === 'deposit') {
            return 'text-green-400';
        }
        return 'text-red-400';
    }

    onMount(async () => {
        await fetchBalance();
        await fetchProducts();
        loading = false;
    })
</script>

<div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
            <i class="fas fa-chart-pie text-blue-400 text-2xl mr-3"></i>
            <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <div class="flex gap-4">
            <button class="bg-gradient rounded-lg py-3 px-6 text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center card-hover shadow-lg transform hover:-translate-y-0.5">
                <i class="fas fa-plus mr-2"></i> Topup
            </button>
            <button class="bg-red-600 rounded-lg py-3 px-6 text-white font-semibold hover:bg-red-700 transition-all duration-200 flex items-center justify-center card-hover shadow-lg transform hover:-translate-y-0.5">
                <i class="fas fa-minus mr-2"></i> Record Expense
            </button>
        </div>
    </div>

    <!-- Balance Card -->
    <div class="bg-gradient rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <p class="text-gray-300 text-sm font-medium mb-2">Current Balance</p>
                    <h2 class="text-4xl font-bold text-white">{formatCurrency(wallet.balance)}</h2>
                </div>
                <div class="w-16 h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center shadow-lg">
                    <i class="fas fa-wallet text-white text-2xl"></i>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-gray-400 text-xs">Last updated: {formatDate(wallet.updated_at)}</p>
                <button onclick={fetchBalance}
                        class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fas fa-sync-alt text-sm"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Income -->
        <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-300 text-sm font-medium">Total Income</h3>
                    <div class="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-arrow-down text-green-400"></i>
                    </div>
                </div>
                    {#await trxData then trxs}
                    <p class="text-2xl font-bold text-white">
                        {
                            formatCurrency(
                                trxs.filter(t => t.type?.toLowerCase() === 'topup' || t.type?.toLowerCase() === 'deposit').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                            )
                        }
                    </p>
                    {/await}

            </div>
        </div>

        <!-- Total Expenses -->
        <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-300 text-sm font-medium">Total Expenses</h3>
                    <div class="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-arrow-up text-red-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-white">
                    {#await trxData then trxs}
                        {formatCurrency(
                        trxs
                            .filter(t => t.type?.toLowerCase() !== 'topup' && t.type?.toLowerCase() !== 'deposit')
                            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                    )}                        
                    {/await}

                </p>
            </div>
        </div>

        <!-- Total Transactions -->
        <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-gray-300 text-sm font-medium">Total Transactions</h3>
                    <div class="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-exchange-alt text-blue-400"></i>
                    </div>
                </div>
                <p class="text-2xl font-bold text-white">
                    {#await trxData then trxs}
                        {trxs.length}
                    {/await}
                </p>
            </div>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-white flex items-center">
                    <i class="fas fa-history text-blue-400 mr-3"></i>
                    Recent Transactions
                </h2>
                <!-- <button onclick={fetchTransactions}
                        class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fas fa-sync-alt text-sm"></i>
                </button> -->
            </div>

            {#await trxData}
                <div class="flex justify-center items-center py-12">
                    <div class="animate-spin">
                        <i class="fas fa-spinner text-blue-400 text-3xl"></i>
                    </div>
                </div>
            {:then trxs} 
                {#if trxs.length === 0}
                    <div class="text-center py-12">
                        <i class="fas fa-inbox text-gray-500 text-4xl mb-4"></i>
                        <p class="text-gray-400 text-sm">No transactions yet</p>
                    </div>
                {:else}
                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        <!-- {#each transactions as transaction (transaction.id)} -->
                        {#each trxs as transaction (transaction.id)}
                            <div class="flex items-center justify-between p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200 border border-gray-600">
                                <div class="flex items-center space-x-4 flex-1">
                                    <div class="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                        <i class="fas {getTransactionIcon(transaction.type)}"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-white font-medium">{transaction.description || transaction.type}</p>
                                        <p class="text-gray-400 text-xs">{formatDate(transaction.created_at || transaction.date)}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="{getTransactionColor(transaction.type)} font-semibold">
                                        {transaction.type?.toLowerCase() === 'topup' || transaction.type?.toLowerCase() === 'deposit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            {/await}
            
        </div>
    </div>

    <!-- Products Section -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-semibold text-white flex items-center">
                    <i class="fas fa-shopping-bag text-blue-400 mr-3"></i>
                    Featured Products
                </h2>
                <button onclick={fetchProducts}
                        class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fas fa-sync-alt text-sm"></i>
                </button>
            </div>

            {#if products.length === 0}
                <div class="text-center py-12">
                    <i class="fas fa-box-open text-gray-500 text-4xl mb-4"></i>
                    <p class="text-gray-400 text-sm">No products available</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {#each products as product (product.id)}
                        <div class="group relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden card-hover transform hover:-translate-y-2 transition-all duration-300 border border-gray-600 hover:border-blue-500">
                            <!-- Gradient Background -->
                            <div class="absolute inset-0 bg-gradient-to-br {product.color || 'from-blue-400 to-blue-600'} opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            
                            <!-- Product Content -->
                            <div class="relative p-6 h-full flex flex-col">
                                <!-- Icon -->
                                <div class="mb-4">
                                    <div class="w-14 h-14 bg-gradient-to-br {product.color || 'from-blue-400 to-blue-600'} rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                        <i class="fas {product.icon || 'fa-box'} text-white text-xl"></i>
                                    </div>
                                </div>

                                <!-- Title -->
                                <h3 class="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-200">
                                    {product.name}
                                </h3>

                                <!-- Description -->
                                <p class="text-gray-300 text-sm mb-4 flex-grow">
                                    {product.description}
                                </p>

                                <!-- Price -->
                                <div class="flex items-center justify-between pt-4 border-t border-gray-600">
                                    <span class="text-2xl font-bold text-blue-400">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <button 
                                        onclick={() => handleBuyProduct(product)}
                                        class="bg-gradient rounded-lg py-2 px-4 text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-md transform group-hover:scale-105 cursor-pointer">
                                        <i class="fas fa-cart-plus mr-1"></i> Buy
                                    </button>
                                </div>
                            </div>

                            <!-- Hover Glow Effect -->
                            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div class="absolute inset-0 bg-gradient-to-br {product.color || 'from-blue-400 to-blue-600'} opacity-10 blur-xl"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
