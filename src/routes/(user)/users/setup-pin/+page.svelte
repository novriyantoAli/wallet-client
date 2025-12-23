<script>
    import { alertSuccess, alertError } from "$lib/alert";
    import { userSetupPin, userUpdatePin } from "$lib/api/UserApi";
    import { onMount } from "svelte";

    const token = localStorage.getItem('token');
    const userSession = JSON.parse(localStorage.getItem('user'));

    let pinStatus = $state({
        hasPin: false,
        loading: true,
    });

    const setupPin = $state({
        pin: '',
        confirm_pin: '',
    });

    const updatePin = $state({
        current_pin: '',
        new_pin: '',
        confirm_new_pin: '',
    });

    async function handleSetupPin(e) {
        e.preventDefault();

        if (setupPin.pin !== setupPin.confirm_pin) {
            await alertError("PIN and confirm PIN do not match");
            return;
        }

        if (setupPin.pin.length < 4 || setupPin.pin.length > 8) {
            await alertError("PIN must be between 4 and 8 digits");
            return;
        }

        if (!/^\d+$/.test(setupPin.pin)) {
            await alertError("PIN must contain only numbers");
            return;
        }

        try {
            const response = await userSetupPin(token, userSession.id, {pin: setupPin.pin});
            const responseBody = await response.json();

            console.log(responseBody);

            if (response.status === 200 || response.status === 201) {
                setupPin.pin = '';
                setupPin.confirm_pin = '';
                pinStatus.hasPin = true;
                await alertSuccess("PIN has been set successfully");
            } else {
                await alertError(responseBody.error || "Failed to set PIN");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function handleUpdatePin(e) {
        e.preventDefault();

        if (updatePin.new_pin !== updatePin.confirm_new_pin) {
            await alertError("New PIN and confirm PIN do not match");
            return;
        }

        if (updatePin.new_pin.length < 4 || updatePin.new_pin.length > 8) {
            await alertError("PIN must be between 4 and 8 digits");
            return;
        }

        if (!/^\d+$/.test(updatePin.new_pin)) {
            await alertError("PIN must contain only numbers");
            return;
        }

        if (!/^\d+$/.test(updatePin.current_pin)) {
            await alertError("Current PIN must contain only numbers");
            return;
        }

        try {
            const response = await userUpdatePin(token, userSession.id, {
                current_pin: updatePin.current_pin,
                new_pin: updatePin.new_pin
            });
            const responseBody = await response.json();

            console.log(responseBody);

            if (response.status === 200) {
                updatePin.current_pin = '';
                updatePin.new_pin = '';
                updatePin.confirm_new_pin = '';
                await alertSuccess("PIN has been updated successfully");
            } else {
                await alertError(responseBody.error || "Failed to update PIN");
            }
        } catch (error) {
            await alertError(error.message);
        }
    }

    async function fetchPinStatus() {
        try {
            // This is a placeholder - adjust based on your actual API endpoint
            // You might need to add a new endpoint to check PIN status
            pinStatus.loading = false;
        } catch (error) {
            console.error(error);
            pinStatus.loading = false;
        }
    }

    onMount(async () => {
        await fetchPinStatus();
    })
</script>

<div class="flex items-center mb-6">
    <i class="fas fa-shield-alt text-green-400 text-2xl mr-3"></i>
    <h1 class="text-2xl font-bold text-white">Security PIN</h1>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Setup PIN Form -->
    {#if !pinStatus.hasPin}
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-6">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <i class="fas fa-lock text-white"></i>
                </div>
                <h2 class="text-xl font-semibold text-white">Setup Your PIN</h2>
            </div>
            <p class="text-gray-300 text-sm mb-5">Create a 4-8 digit PIN for additional security</p>
            <form onsubmit={handleSetupPin}>
                <div class="mb-5">
                    <label for="pin" class="block text-gray-300 text-sm font-medium mb-2">PIN</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="pin" name="pin"
                               class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                               placeholder="Enter 4-8 digit PIN" bind:value={setupPin.pin} required maxlength="8" inputmode="numeric">
                    </div>
                </div>

                <div class="mb-5">
                    <label for="confirm_pin" class="block text-gray-300 text-sm font-medium mb-2">Confirm PIN</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="confirm_pin" name="confirm_pin"
                               class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                               placeholder="Confirm PIN" bind:value={setupPin.confirm_pin} required maxlength="8" inputmode="numeric">
                    </div>
                </div>

                <div class="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
                    <p class="text-blue-300 text-sm flex items-start">
                        <i class="fas fa-info-circle mt-0.5 mr-3 flex-shrink-0"></i>
                        <span>Your PIN must be 4-8 digits and contain only numbers. Keep it secure and remember it!</span>
                    </p>
                </div>

                <div class="mt-6">
                    <button type="submit"
                            class="w-full bg-gradient text-white py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center">
                        <i class="fas fa-lock mr-2"></i> Setup PIN
                    </button>
                </div>
            </form>
        </div>
    </div>
    {:else}
    <!-- Update PIN Form (shown when user already has a PIN) -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-6">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <i class="fas fa-sync text-white"></i>
                </div>
                <h2 class="text-xl font-semibold text-white">Change Your PIN</h2>
            </div>
            <form onsubmit={handleUpdatePin}>
                <div class="mb-5">
                    <label for="current_pin" class="block text-gray-300 text-sm font-medium mb-2">Current PIN</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="current_pin" name="current_pin"
                               class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                               placeholder="Enter your current PIN" bind:value={updatePin.current_pin} required maxlength="8" inputmode="numeric">
                    </div>
                </div>

                <div class="mb-5">
                    <label for="new_pin" class="block text-gray-300 text-sm font-medium mb-2">New PIN</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="new_pin" name="new_pin"
                               class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                               placeholder="Enter new PIN" bind:value={updatePin.new_pin} required maxlength="8" inputmode="numeric">
                    </div>
                </div>

                <div class="mb-5">
                    <label for="confirm_new_pin" class="block text-gray-300 text-sm font-medium mb-2">Confirm New PIN</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="confirm_new_pin" name="confirm_new_pin"
                               class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                               placeholder="Confirm new PIN" bind:value={updatePin.confirm_new_pin} required maxlength="8" inputmode="numeric">
                    </div>
                </div>

                <div class="mt-6">
                    <button type="submit"
                            class="w-full bg-gradient text-white py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center">
                        <i class="fas fa-sync mr-2"></i> Update PIN
                    </button>
                </div>
            </form>
        </div>
    </div>
    {/if}

    <!-- PIN Information Card -->
    <div class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in">
        <div class="p-6">
            <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <i class="fas fa-question-circle text-white"></i>
                </div>
                <h2 class="text-xl font-semibold text-white">PIN Information</h2>
            </div>

            <div class="space-y-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-400 mt-0.5 mr-3"></i>
                    </div>
                    <div>
                        <p class="text-gray-300 font-medium">Keep it Secure</p>
                        <p class="text-gray-400 text-sm">Your PIN should be kept confidential and not shared with anyone</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-400 mt-0.5 mr-3"></i>
                    </div>
                    <div>
                        <p class="text-gray-300 font-medium">Length Requirements</p>
                        <p class="text-gray-400 text-sm">PIN must be between 4 and 8 digits</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-400 mt-0.5 mr-3"></i>
                    </div>
                    <div>
                        <p class="text-gray-300 font-medium">Numeric Only</p>
                        <p class="text-gray-400 text-sm">Use only numbers (0-9) in your PIN</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-400 mt-0.5 mr-3"></i>
                    </div>
                    <div>
                        <p class="text-gray-300 font-medium">Additional Security</p>
                        <p class="text-gray-400 text-sm">Your PIN provides an extra layer of security for sensitive transactions</p>
                    </div>
                </div>

                <div class="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4 mt-5">
                    <p class="text-yellow-300 text-sm flex items-start">
                        <i class="fas fa-exclamation-triangle mt-0.5 mr-3 flex-shrink-0"></i>
                        <span>If you forget your PIN, you may need to contact support. Make sure to remember it!</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    :global(.shadow-custom) {
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }

    :global(.card-hover) {
        transition: all 0.3s ease;
    }

    :global(.card-hover:hover) {
        box-shadow: 0 25px 35px -5px rgba(0, 0, 0, 0.4);
        transform: translateY(-2px);
    }

    :global(.animate-fade-in) {
        animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
