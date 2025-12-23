<script>
    import { goto } from '$app/navigation';
    import { alertSuccess, alertError } from '$lib/alert';
    import { page } from '$app/stores';

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Get data from URL params or default values
    let receiptData = $state({
        status: 'success',
        message: 'Transaksi Berhasil',
        amount: 0,
        productName: '',
        phoneNumber: '',
        referenceNumber: '',
        date: new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
    });

    function formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    }

    function printReceipt() {
        window.print();
    }

    function shareReceipt() {
        const text = `Transaksi Berhasil!\n\n${receiptData.productName}\n${formatCurrency(receiptData.amount)}\n${receiptData.phoneNumber}\n\nRef: ${receiptData.referenceNumber}\nTanggal: ${receiptData.date}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Receipt',
                text: text
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text)
                .then(() => alertSuccess('Receipt copied to clipboard'))
                .catch(() => alertError('Failed to copy receipt'));
        }
    }

    function goHome() {
        goto('/dashboard');
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    <!-- Receipt Container -->
    <div class="w-full max-w-md">
        <!-- Receipt Card -->
        <div class="bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden print:border-black print:shadow-none print:bg-white print:text-black">
            <!-- Success Header -->
            <div class="bg-gradient-to-b from-green-600 to-green-700 p-8 text-center relative overflow-hidden print:bg-white print:border-b-4 print:border-black">
                <!-- Decorative background -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                </div>
                
                <div class="relative z-10">
                    <!-- Success Icon -->
                    <div class="flex justify-center mb-6">
                        <div class="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center animate-bounce">
                            <i class="fas fa-check text-white text-5xl"></i>
                        </div>
                    </div>

                    <!-- Success Text -->
                    <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2 print:text-3xl print:text-black">SUKSES!</h1>
                    <p class="text-green-100 text-lg print:text-black">Transaksi Berhasil</p>
                </div>
            </div>

            <!-- Receipt Content -->
            <div class="p-8 space-y-8 print:p-6">
                <!-- Amount Section -->
                <div class="text-center py-6 border-b border-gray-700 print:border-black">
                    <p class="text-gray-400 text-sm mb-2 print:text-gray-600">Total Pembayaran</p>
                    <h2 class="text-4xl font-bold text-blue-400 print:text-black">{formatCurrency(receiptData.amount)}</h2>
                </div>

                <!-- Product Details -->
                <div class="space-y-4 print:space-y-3">
                    <!-- Product Name -->
                    <div class="flex justify-between items-start">
                        <span class="text-gray-400 print:text-gray-600">Produk</span>
                        <span class="text-white font-semibold text-right print:text-black">{receiptData.productName}</span>
                    </div>

                    <!-- Phone Number -->
                    {#if receiptData.phoneNumber}
                        <div class="flex justify-between items-start">
                            <span class="text-gray-400 print:text-gray-600">Nomor</span>
                            <span class="text-white font-mono text-right print:text-black">{receiptData.phoneNumber}</span>
                        </div>
                    {/if}
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-700 print:border-gray-400"></div>

                <!-- Transaction Details -->
                <div class="space-y-3 text-sm print:text-xs print:space-y-2">
                    <!-- Reference Number -->
                    <div class="flex justify-between">
                        <span class="text-gray-400 print:text-gray-600">Ref</span>
                        <span class="text-white font-mono print:text-black">{receiptData.referenceNumber}</span>
                    </div>

                    <!-- Date -->
                    <div class="flex justify-between">
                        <span class="text-gray-400 print:text-gray-600">Tanggal</span>
                        <span class="text-white print:text-black">{receiptData.date}</span>
                    </div>

                    <!-- Time -->
                    <div class="flex justify-between">
                        <span class="text-gray-400 print:text-gray-600">Jam</span>
                        <span class="text-white print:text-black">{receiptData.time}</span>
                    </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-700 print:border-gray-400"></div>

                <!-- Action Buttons (Hide on Print) -->
                <div class="space-y-3 print:hidden">
                    <!-- Print and Share Row -->
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            onclick={printReceipt}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                            <i class="fas fa-print"></i>
                            <span>Cetak</span>
                        </button>
                        <button
                            onclick={shareReceipt}
                            class="bg-gray-700 hover:bg-gray-600 transition-all duration-200 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                            <i class="fas fa-share-alt"></i>
                            <span>Bagikan</span>
                        </button>
                    </div>

                    <!-- Back to Home Button -->
                    <button
                        onclick={goHome}
                        class="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90 transition-all duration-200 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95">
                        <i class="fas fa-home mr-2"></i>
                        KEMBALI KE BERANDA
                    </button>
                </div>

                <!-- Print Footer -->
                <div class="text-center text-xs text-gray-500 hidden print:block print:text-gray-600 mt-8 pt-8 border-t border-gray-400">
                    <p>Terima kasih telah bertransaksi bersama kami</p>
                    <p class="mt-2">wallet-client.com</p>
                </div>
            </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center mt-6 text-gray-400 text-sm print:hidden">
            <p>Simpan nomor referensi untuk keperluan verifikasi</p>
        </div>
    </div>
</div>

<style>
    @media print {
        :global(body) {
            background: white !important;
        }

        :global(.min-h-screen) {
            background: white !important;
        }

        /* Hide non-essential elements during print */
        :global(.print\:hidden) {
            display: none !important;
        }

        /* Ensure good contrast for print */
        :global(.print\:text-black) {
            color: black !important;
        }

        :global(.print\:bg-white) {
            background: white !important;
        }

        :global(.print\:border-black) {
            border-color: black !important;
        }

        :global(.print\:border-gray-400) {
            border-color: #9ca3af !important;
        }

        :global(.print\:text-gray-600) {
            color: #4b5563 !important;
        }
    }

    :global(.animate-bounce) {
        animation: bounce 2s infinite;
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    :global(.print\:text-xs) {
        font-size: 0.75rem;
    }

    :global(.print\:space-y-2 > * + *) {
        margin-top: 0.5rem;
    }
</style>
