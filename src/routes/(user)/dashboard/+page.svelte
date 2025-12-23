<script>
    import { alertError, alertSuccess } from "$lib/alert";
    import { getWallet } from "$lib/api/WalletApi";
    import { getRecentTransactions } from "$lib/api/TransactionApi";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

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
            const response = await getRecentTransactions(token, wallet.id);
            const responseBody = await response.json();

            console.log(responseBody);
            
            if (response.status === 200) {
                transactions = responseBody.data;
            }
        }
        
        return transactions;
    });

    let loading = $state(true);

    async function fetchBalance() {
        try {
            const response = await getWallet(token, user.id);
            const responseBody = await response.json();
            
            console.log('fetch balance:', responseBody.data);
            
            if (response.status === 200) {
                wallet = responseBody.data;
            } else {
                throw new Error(responseBody.error || "Failed to fetch balance");
            }
        } catch (error) {
            await alertError(error.message);
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
        if (type?.toLowerCase() === 'transfer' || type?.toLowerCase() === 'income' || type?.toLowerCase() === 'deposit') {
            return 'text-green-400';
        }
        return 'text-red-400';
    }

    onMount(async () => {
        await fetchBalance();
        loading = false;
    })
</script>

<div class="space-y-4 sm:space-y-6 md:space-y-8">
    <!-- Header -->
    <div class="flex items-center mb-4 sm:mb-6 md:mb-8">
        <i class="fas fa-chart-pie text-blue-400 text-xl sm:text-2xl mr-2 sm:mr-3"></i>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
    </div>

    <!-- Balance Card -->
    <div class="bg-gradient rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6 md:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div class="flex-1">
                    <p class="text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Current Balance</p>
                    <h2 class="text-3xl sm:text-4xl font-bold text-white">{formatCurrency(wallet.balance)}</h2>
                </div>
                <div class="w-14 sm:w-16 h-14 sm:h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <i class="fas fa-wallet text-white text-xl sm:text-2xl"></i>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <p class="text-gray-400 text-xs">Last updated: {formatDate(wallet.updated_at)}</p>
                <button onclick={fetchBalance}
                        title="Refresh balance"
                        class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fas fa-sync-alt text-sm"></i>
                </button>
            </div>
        </div>
    </div>

        <!-- Layanan Utama Section -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-2 sm:gap-3">
                <i class="fas fa-th text-blue-400 text-base sm:text-lg"></i>
                LAYANAN UTAMA
            </h2>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <!-- Voucher WiFi -->
                <button onclick={() => goto('/purchase-wifi')} class="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                            <i class="fas fa-wifi text-white text-2xl"></i>
                        </div>
                        <span class="text-white text-xs sm:text-sm font-semibold text-center">Voucher WiFi</span>
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6">
            <div class="flex items-center justify-between mb-4 sm:mb-6">
                <h2 class="text-lg sm:text-xl font-semibold text-white flex items-center">
                    <i class="fas fa-history text-blue-400 mr-2 sm:mr-3 text-base sm:text-lg"></i>
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
                    <div class="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                        <!-- {#each transactions as transaction (transaction.id)} -->
                        {#each trxs as transaction (transaction.id)}
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200 border border-gray-600 gap-3 sm:gap-4">
                                <div class="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                    <div class="w-10 sm:w-12 h-10 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <i class="fas {getTransactionIcon(transaction.type)} text-sm sm:text-base"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-white font-medium text-sm sm:text-base truncate">{transaction.description || transaction.type}</p>
                                        <p class="text-gray-400 text-xs">{formatDate(transaction.created_at || transaction.date)}</p>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <p class="{getTransactionColor(transaction.type)} font-semibold text-sm sm:text-base">
                                        {transaction.type?.toLowerCase() === 'transfer' || transaction.type?.toLowerCase() === 'topup' || transaction.type?.toLowerCase() === 'deposit' ? '+' : '-'}
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



</div>
