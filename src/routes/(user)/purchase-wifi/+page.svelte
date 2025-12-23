<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { alertError, alertSuccess } from "$lib/alert";
    import { getProviders } from "$lib/api/ProviderApi";
    import { productWiFiFilter } from "$lib/api/ProductApi";
    import { purchaseProductWifi } from '$lib/api/PurchaseApi';

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    let selectedProvider = $state(null);
    let selectedPackage = $state(null);
    let providers = $state([]);
    let packages = $state([]);
    let loading = $state(true);
    let loadingPackages = $state(false);
    let showPinModal = $state(false);
    let pinInput = $state('');
    let pinError = $state('');
    let errorMessage = $state('');

    onMount(async () => {
        await fetchProviders();
    });

    async function fetchProviders() {
        try {
            loading = true;
            errorMessage = '';
            const response = await getProviders(token);
            const responseBody = await response.json();

            console.log('fetch providers:', responseBody);

            if (response.status === 200) {
                providers = responseBody.data || [];
            } else {
                throw new Error(responseBody.error || "Failed to fetch providers");
            }
        } catch (error) {
            errorMessage = error.message;
            await alertError(error.message);
            providers = [];
        } finally {
            loading = false;
        }
    }

    async function fetchPackages(providerId) {
        try {
            loadingPackages = true;
            errorMessage = '';
            packages = [];
            const response = await productWiFiFilter(token, providerId);
            const responseBody = await response.json();

            console.log('fetch packages:', responseBody);

            if (response.status === 200) {
                packages = responseBody.data || [];
            } else {
                throw new Error(responseBody.error || "Failed to fetch packages");
            }
        } catch (error) {
            errorMessage = error.message;
            await alertError(error.message);
            packages = [];
        } finally {
            loadingPackages = false;
        }
    }

    function selectPackage(pkg) {
        selectedPackage = pkg;
    }

    async function selectProvider(provider) {
        selectedProvider = provider;
        selectedPackage = null;
        await fetchPackages(provider.id);
    }

    async function handlePurchase() {
        if (!selectedProvider || !selectedPackage) {
            await alertError('Silahkan pilih provider dan paket');
            return;
        }

        // Show PIN modal
        showPinModal = true;
        pinInput = '';
        pinError = '';
    }

    function addPinDigit(digit) {
        if (pinInput.length < 6) {
            pinInput += digit;
            pinError = '';
        }
    }

    function removePinDigit() {
        pinInput = pinInput.slice(0, -1);
        pinError = '';
    }

    async function submitPin() {
        if (pinInput.length !== 6) {
            pinError = 'PIN harus 6 digit';
            return;
        }

        try {
            // TODO: Implement API call to verify PIN and process purchase
            // const response = await purchaseWiFi(token, {
            //     provider_id: selectedProvider.id,
            //     product_id: selectedPackage.id,
            //     pin: pinInput
            // });

            const response = await purchaseProductWifi(token, pinInput, selectedPackage.id);
            const responseBody = await response.json();

            if (response.status !== 200) {
                throw new Error(responseBody.error || 'Gagal melakukan pembelian');
            } else {
                await alertSuccess(`Pembelian ${selectedPackage.name} dari ${selectedProvider.name} berhasil!`);
            }
        } catch (error) {
            errorMessage = error.message;
        } finally {
            closePinModal();
        }
    }

    function closePinModal() {
        showPinModal = false;
        pinInput = '';
        pinError = '';
    }

    function goBack() {
        goto('/dashboard');
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header -->
    <div class="sticky top-0 z-40 bg-gray-800 bg-opacity-80 backdrop-blur border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div class="flex items-center gap-4 sm:gap-6">
                <button
                    onclick={goBack}
                    class="text-gray-400 hover:text-white transition-colors duration-200"
                    title="Kembali">
                    <i class="fas fa-chevron-left text-xl sm:text-2xl"></i>
                </button>
                <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <i class="fas fa-wifi text-blue-400 text-lg sm:text-xl"></i>
                    Voucher Wi-Fi
                </h1>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Error Message Alert -->
        {#if errorMessage}
            <div class="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 sm:p-6 mb-6 animate-fade-in">
                <div class="flex items-start gap-3 sm:gap-4">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-400 text-xl sm:text-2xl mt-0.5"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-red-400 font-semibold text-sm sm:text-base mb-1">Error</h3>
                        <p class="text-red-300 text-xs sm:text-sm">{errorMessage}</p>
                    </div>
                    <button
                        onclick={() => errorMessage = ''}
                        class="text-red-400 hover:text-red-300 transition-colors duration-200 flex-shrink-0">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
            </div>
        {/if}

        <!-- Select Provider Section -->
        <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in mb-6">
            <div class="p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <i class="fas fa-building text-blue-400"></i>
                    Pilih Provider
                </h2>
                
                {#if loading}
                    <div class="flex justify-center items-center py-12">
                        <div class="animate-spin">
                            <i class="fas fa-spinner text-blue-400 text-3xl"></i>
                        </div>
                    </div>
                {:else if providers.length === 0}
                    <div class="text-center py-12">
                        <i class="fas fa-exclamation-circle text-gray-500 text-4xl mb-4"></i>
                        <p class="text-gray-400 text-sm">Provider tidak tersedia</p>
                    </div>
                {:else}
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {#each providers as provider (provider.id)}
                            <button
                                onclick={() => selectProvider(provider)}
                                class="group relative p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 {
                                    selectedProvider?.id === provider.id
                                        ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                                        : 'border-gray-600 bg-gray-700 bg-opacity-50 hover:border-blue-400'
                                }">
                                <div class="flex flex-col items-center gap-3">
                                    <div class="text-3xl sm:text-4xl">
                                        <i class="fas fa-signal text-white"></i>
                                    </div>
                                    <span class="text-white text-sm sm:text-base font-semibold text-center">
                                        {provider.name}
                                    </span>
                                </div>
                                {#if selectedProvider?.id === provider.id}
                                    <div class="absolute top-2 right-2 sm:top-3 sm:right-3 text-blue-400">
                                        <i class="fas fa-check-circle text-lg sm:text-xl"></i>
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Select Package Section -->
        {#if selectedProvider}
            <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in mb-6">
                <div class="p-4 sm:p-6">
                    <h2 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                        <i class="fas fa-box text-blue-400"></i>
                        Pilih Paket
                    </h2>

                    {#if loadingPackages}
                        <div class="flex justify-center items-center py-12">
                            <div class="animate-spin">
                                <i class="fas fa-spinner text-blue-400 text-3xl"></i>
                            </div>
                        </div>
                    {:else if packages.length === 0}
                        <div class="text-center py-8">
                            <i class="fas fa-box-open text-gray-500 text-4xl mb-4"></i>
                            <p class="text-gray-400">Paket tidak tersedia</p>
                        </div>
                    {:else}
                        <div class="space-y-3 sm:space-y-4">
                            {#each packages as pkg (pkg.id)}
                                <button
                                    onclick={() => selectPackage(pkg)}
                                    class="w-full p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 text-left group {
                                        selectedPackage?.id === pkg.id
                                            ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                                            : 'border-gray-600 bg-gray-700 bg-opacity-50 hover:border-blue-400'
                                    }">
                                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                        <div class="flex-1">
                                            <h3 class="text-white font-semibold text-base sm:text-lg mb-1">
                                                {pkg.name}
                                            </h3>
                                            <p class="text-gray-400 text-xs sm:text-sm">
                                                Berlaku: {pkg.validity}
                                            </p>
                                        </div>
                                        <div class="flex items-center gap-3 sm:gap-4">
                                            <span class="text-lg sm:text-2xl font-bold text-blue-400 whitespace-nowrap">
                                                {formatCurrency((pkg.price_sell))}
                                            </span>
                                            {#if selectedPackage?.id === pkg.id}
                                                <div class="text-blue-400">
                                                    <i class="fas fa-check-circle text-xl sm:text-2xl"></i>
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Action Buttons -->
        {#if selectedProvider && selectedPackage}
            <div class="flex gap-3 sm:gap-4">
                <button
                    onclick={goBack}
                    class="flex-1 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 text-white font-semibold py-3 sm:py-4 rounded-lg">
                    Batal
                </button>
                <button
                    onclick={handlePurchase}
                    class="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all duration-200 text-white font-semibold py-3 sm:py-4 rounded-lg shadow-lg">
                    Beli Sekarang
                </button>
            </div>
        {/if}
    </div>

    <!-- PIN Modal -->
    {#if showPinModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-gray-800 bg-opacity-95 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm animate-fade-in flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="bg-gray-900 bg-opacity-80 p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                    <button
                        onclick={closePinModal}
                        class="text-gray-400 hover:text-white transition-colors duration-200">
                        <i class="fas fa-chevron-left text-xl"></i>
                    </button>
                    <h2 class="text-lg sm:text-xl font-bold text-white flex-1 text-center">
                        Masukkan PIN
                    </h2>
                    <button
                        onclick={submitPin}
                        disabled={pinInput.length < 6}
                        class="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200 font-semibold text-sm">
                        Konfirmasi
                    </button>
                </div>

                <!-- Content - Scrollable -->
                <div class="p-6 sm:p-8 overflow-y-auto flex-1">
                    <!-- PIN Display -->
                    <div class="flex justify-center gap-3 mb-6 sm:mb-8">
                        {#each Array(6) as _, i}
                            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-600 flex items-center justify-center {
                                i < pinInput.length
                                    ? 'bg-blue-500 bg-opacity-20 border-blue-500'
                                    : 'bg-gray-700 bg-opacity-50'
                            }">
                                {#if i < pinInput.length}
                                    <span class="text-white text-lg sm:text-xl font-bold">•</span>
                                {/if}
                            </div>
                        {/each}
                    </div>

                    <!-- Error Message -->
                    {#if pinError}
                        <div class="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-6 text-center">
                            <p class="text-red-400 text-sm">{pinError}</p>
                        </div>
                    {/if}

                    <!-- Forgot PIN Link -->
                    <div class="text-center mb-8">
                        <button
                            onclick={() => alertError('Hubungi support untuk mereset PIN')}
                            class="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-semibold">
                            Lupa PIN?
                        </button>
                    </div>

                    <!-- Number Pad -->
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        <!-- Row 1 -->
                        <button
                            onclick={() => addPinDigit('1')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            1
                        </button>
                        <button
                            onclick={() => addPinDigit('2')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            2
                        </button>
                        <button
                            onclick={() => addPinDigit('3')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            3
                        </button>

                        <!-- Row 2 -->
                        <button
                            onclick={() => addPinDigit('4')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            4
                        </button>
                        <button
                            onclick={() => addPinDigit('5')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            5
                        </button>
                        <button
                            onclick={() => addPinDigit('6')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            6
                        </button>

                        <!-- Row 3 -->
                        <button
                            onclick={() => addPinDigit('7')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            7
                        </button>
                        <button
                            onclick={() => addPinDigit('8')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            8
                        </button>
                        <button
                            onclick={() => addPinDigit('9')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            9
                        </button>

                        <!-- Row 4 -->
                        <button
                            onclick={() => {}}
                            disabled
                            class="bg-gray-700 rounded-lg py-4 text-gray-500 font-semibold text-lg cursor-not-allowed opacity-50">
                            <i class="fas fa-fingerprint"></i>
                        </button>
                        <button
                            onclick={() => addPinDigit('0')}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            0
                        </button>
                        <button
                            onclick={removePinDigit}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 rounded-lg py-4 text-white font-semibold text-lg active:scale-95">
                            <i class="fas fa-backspace"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
