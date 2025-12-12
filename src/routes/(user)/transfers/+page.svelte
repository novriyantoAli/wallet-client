<script>
    import { alertError, alertSuccess } from "$lib/alert";
    import { getWallet, walletTransferFund } from "$lib/api/WalletApi";
    import { userGetLevelUsers } from "$lib/api/UserApi";
    import { onMount } from "svelte";
    import Swal from "sweetalert2";

    const token = localStorage.getItem('token');
    const userSession = JSON.parse(localStorage.getItem('user'));

    let wallet = $state({
        id: 0,
        balance: 0,
        currency: 'IDR',
        updated_at: new Date(),
    });

    let clientUsers = $state([]);
    let filteredUsers = $state([]);
    let selectedRecipient = $state(null);
    let recipientId = $state('');
    let amount = $state('');
    let description = $state('');
    let loading = $state(true);
    let searchQuery = $state('');
    let showDropdown = $state(false);
    let searchLoading = $state(false);
    let debounceTimer;

    async function fetchBalance() {
        try {
            const response = await getWallet(token, userSession.id);
            const responseBody = await response.json();

            if (response.status === 200) {
                wallet = responseBody;
            } else {
                throw new Error(responseBody.error || "Failed to fetch balance");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function fetchClientUsers() {
        try {
            const response = await userGetLevelUsers(token);
            const responseBody = await response.json();

            console.log(responseBody);
            

            if (response.status === 200) {
                clientUsers = responseBody.data || [];
            } else {
                throw new Error(responseBody.error || "Failed to fetch users");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function searchUsers(query) {
        if (!query || query.trim().length === 0) {
            filteredUsers = [];
            showDropdown = false;
            return;
        }

        searchLoading = true;
        try {
            const localFiltered = clientUsers.filter(user =>
                user.name?.toLowerCase().includes(query.toLowerCase()) ||
                user.email?.toLowerCase().includes(query.toLowerCase()) ||
                user.id.toString().includes(query)
            );

            filteredUsers = localFiltered;
            showDropdown = true;
        } catch (error) {
            console.error('Search error:', error);
            filteredUsers = [];
        } finally {
            searchLoading = false;
        }
    }

    async function handleSearchInput(event) {
        searchQuery = event.target.value;
        
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
            searchUsers(searchQuery);
        }, 300);
    }

    function selectRecipient(user) {
        selectedRecipient = user;
        recipientId = user.id.toString();
        searchQuery = user.name;
        filteredUsers = [];
        showDropdown = false;
    }

    function clearRecipient() {
        selectedRecipient = null;
        recipientId = '';
        searchQuery = '';
        filteredUsers = [];
        showDropdown = false;
    }

    async function handleTransfer() {
        if (!recipientId || !recipientId.trim()) {
            await alertError("Please select recipient");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            await alertError("Please enter a valid amount");
            return;
        }

        if (parseFloat(amount) > wallet.balance) {
            await alertError("Insufficient balance");
            return;
        }

        const { value: confirmed } = await Swal.fire({
            title: 'Confirm Transfer',
            html: `
                <div class="text-left max-w-sm mx-auto px-2 sm:px-4">
                    <div class="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>From:</strong></p>
                        <p class="text-base sm:text-lg font-semibold text-gray-800 break-words">${userSession.name || 'N/A'}</p>
                    </div>
                    <div class="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>To:</strong></p>
                        <p class="text-base sm:text-lg font-semibold text-gray-800 break-words">${selectedRecipient?.name || `User #${recipientId}`}</p>
                    </div>
                    <div class="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>Amount:</strong></p>
                        <p class="text-xl sm:text-2xl font-bold text-blue-600">${formatCurrency(parseFloat(amount))}</p>
                    </div>
                    ${description ? `
                    <div class="mb-2 sm:mb-4">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2"><strong>Description:</strong></p>
                        <p class="text-sm text-gray-800">${description}</p>
                    </div>
                    ` : ''}
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirm Transfer',
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
                const response = await walletTransferFund(token, parseInt(recipientId), parseFloat(amount), description);
                const responseBody = await response.json();

                if (response.status === 200 || response.status === 201) {
                    await alertSuccess("Transfer successful!");
                    recipientId = '';
                    amount = '';
                    description = '';
                    selectedRecipient = null;
                    searchQuery = '';
                    await fetchBalance();
                } else {
                    throw new Error(responseBody.error || "Transfer failed");
                }
            } catch (error) {
                await alertError(error.message);
            }
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: wallet.currency || 'IDR',
        }).format(value);
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

    onMount(async () => {
        await fetchBalance();
        await fetchClientUsers();
        loading = false;
    })
</script>

<div class="space-y-4 sm:space-y-6 md:space-y-8">
    <!-- Header -->
    <div class="flex items-center mb-4 sm:mb-6 md:mb-8">
        <i class="fas fa-exchange-alt text-blue-400 text-xl sm:text-2xl mr-2 sm:mr-3"></i>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Transfer Fund</h1>
    </div>

    <!-- Balance Card -->
    <div class="bg-gradient rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6 md:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div class="flex-1">
                    <p class="text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Available Balance</p>
                    <h2 class="text-3xl sm:text-4xl font-bold text-white">{formatCurrency(wallet.balance)}</h2>
                </div>
                <div class="w-14 sm:w-16 h-14 sm:h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <i class="fas fa-wallet text-white text-xl sm:text-2xl"></i>
                </div>
            </div>
            <p class="text-gray-400 text-xs">Last updated: {formatDate(wallet.updated_at)}</p>
        </div>
    </div>

    <!-- Transfer Form -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <i class="fas fa-arrow-right text-blue-400 text-base sm:text-lg"></i>
                Send Money
            </h2>

            <div class="space-y-4 sm:space-y-6">
                <!-- Recipient Selection -->
                <div>
                    <label for="recipientSearch" class="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                        Select Recipient <span class="text-red-400">*</span>
                    </label>
                    <div class="relative">
                        <div class="relative flex items-center">
                            <input 
                                type="text" 
                                id="recipientSearch"
                                oninput={handleSearchInput}
                                value={searchQuery}
                                onblur={() => setTimeout(() => { showDropdown = false; }, 200)}
                                onfocus={() => { if (filteredUsers.length > 0) showDropdown = true; }}
                                placeholder="Search by name, email, or ID..."
                                class="w-full px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                            />
                            {#if searchLoading}
                                <div class="absolute right-3 animate-spin">
                                    <i class="fas fa-spinner text-blue-400"></i>
                                </div>
                            {/if}
                        </div>
                        
                        {#if showDropdown && filteredUsers.length > 0}
                            <div class="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                                {#each filteredUsers as user (user.id)}
                                    <button 
                                        type="button"
                                        onclick={() => selectRecipient(user)}
                                        class="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors duration-200 border-b border-gray-600 last:border-b-0 flex items-center gap-3">
                                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-user text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-white text-sm font-medium truncate">{user.name}</p>
                                            <p class="text-gray-400 text-xs truncate">{user.email}</p>
                                        </div>
                                        <span class="text-blue-400 text-sm flex-shrink-0">ID: {user.id}</span>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    {#if selectedRecipient}
                        <div class="mt-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-check text-white"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-white text-sm font-medium truncate">{selectedRecipient.name}</p>
                                    <p class="text-gray-400 text-xs truncate">{selectedRecipient.email}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onclick={() => clearRecipient()}
                                title="Clear selection"
                                class="text-gray-400 hover:text-white transition-colors duration-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    {/if}
                </div>

                <!-- Amount -->
                <div>
                    <label for="amount" class="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                        Amount <span class="text-red-400">*</span>
                    </label>
                    <input 
                        type="number" 
                        id="amount"
                        bind:value={amount}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        class="w-full px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                    />
                    {#if amount}
                        <p class="text-blue-400 text-xs sm:text-sm mt-2">Transfer amount: {formatCurrency(parseFloat(amount))}</p>
                    {/if}
                </div>

                <!-- Description -->
                <div>
                    <label for="description" class="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                        Description (Optional)
                    </label>
                    <textarea 
                        id="description"
                        bind:value={description}
                        placeholder="Add a note for the recipient..."
                        rows="3"
                        class="w-full px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base resize-none"
                    ></textarea>
                </div>

                <!-- Submit Button -->
                <button 
                    onclick={handleTransfer}
                    class="w-full bg-gradient rounded-lg py-3 px-4 text-white font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center card-hover shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base">
                    <i class="fas fa-paper-plane mr-2"></i> Transfer Now
                </button>
            </div>
        </div>
    </div>
</div>
