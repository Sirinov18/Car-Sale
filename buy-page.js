// Buy Page JavaScript - Production Ready
(function() {
    'use strict';

    let carData = null;
    let personalData = {};
    let paymentData = {};

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
        loadCarData();
        initializeFormHandlers();
        formatInputFields();
    });

    // Load car data from sessionStorage
    function loadCarData() {
        const storedCar = sessionStorage.getItem('selectedCar');
        
        if (!storedCar) {
            alert('No car selected. Redirecting to home page.');
            window.location.href = 'index.html';
            return;
        }

        try {
            carData = JSON.parse(storedCar);
            populateCarSummary();
            populateVehicleInfo();
            calculatePricing();
        } catch (error) {
            console.error('Error loading car data:', error);
            alert('Error loading car information.');
            window.location.href = 'index.html';
        }
    }

    // Populate car summary section
    function populateCarSummary() {
        document.getElementById('summaryImage').src = carData.image;
        document.getElementById('summaryImage').alt = `${carData.Marks} ${carData.Model}`;
        document.getElementById('summaryImage').onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop';
        };
        
        document.getElementById('summaryTitle').textContent = `${carData.Marks} ${carData.Model}`;
        document.getElementById('summaryYear').textContent = carData.Year;
        document.getElementById('summaryCondition').textContent = carData.Condition;
        document.getElementById('summaryMileage').textContent = carData.Milage;
        document.getElementById('summaryFuel').textContent = carData.FuelType;
    }

    // Populate vehicle info form
    function populateVehicleInfo() {
        document.getElementById('carBrand').value = `${carData.Marks} ${carData.Model}`;
        document.getElementById('carYear').value = carData.Year;
        document.getElementById('carBody').value = carData.BanType;
        document.getElementById('carTransmission').value = carData.Transmission;
        document.getElementById('carEngine').value = `${carData.EngineCapacity} - ${carData.PowerHp}`;
    }

    // Calculate pricing
    function calculatePricing() {
        const price = typeof carData.Price === 'number' ? carData.Price : parseFloat(carData.Price.replace(/[^0-9.]/g, ''));
        const tax = price * 0.10;
        const regFee = 500;
        const total = price + tax + regFee;

        document.getElementById('vehiclePrice').textContent = `$${price.toLocaleString()}`;
        document.getElementById('taxAmount').textContent = `$${tax.toLocaleString()}`;
        document.getElementById('regFee').textContent = `$${regFee.toLocaleString()}`;
        document.getElementById('totalAmount').textContent = `$${total.toLocaleString()}`;
    }

    // Initialize form handlers
    function initializeFormHandlers() {
        // Personal form submission
        const personalForm = document.getElementById('personalForm');
        if (personalForm) {
            personalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Collect personal data
                personalData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    dob: document.getElementById('dob').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    zip: document.getElementById('zip').value
                };

                nextStep(3);
            });
        }

        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Collect payment data (in production, this would be tokenized)
                paymentData = {
                    cardNumber: document.getElementById('cardNumber').value,
                    expiry: document.getElementById('expiry').value,
                    cvv: document.getElementById('cvv').value,
                    cardName: document.getElementById('cardName').value,
                    paymentMethod: document.querySelector('input[name="payment"]:checked').value
                };

                // Process payment (simulate)
                processPurchase();
            });
        }
    }

    // Format input fields
    function formatInputFields() {
        // Card number formatting
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Expiry date formatting
        const expiry = document.getElementById('expiry');
        if (expiry) {
            expiry.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV - numbers only
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Phone formatting
        const phone = document.getElementById('phone');
        if (phone) {
            phone.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9+\-() ]/g, '');
            });
        }
    }

    // Process purchase
    function processPurchase() {
        // Show loading state
        const submitBtn = document.querySelector('#paymentForm .btn-next');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(function() {
            // Generate order ID
            const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
            
            // Populate confirmation
            document.getElementById('orderId').textContent = orderId;
            document.getElementById('orderVehicle').textContent = `${carData.Marks} ${carData.Model} (${carData.Year})`;
            document.getElementById('orderTotal').textContent = document.getElementById('totalAmount').textContent;

            // Move to confirmation step
            nextStep(4);

            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Clear sensitive data
            paymentData = {};
            
            // Store order in sessionStorage for receipt
            sessionStorage.setItem('lastOrder', JSON.stringify({
                orderId: orderId,
                car: carData,
                personal: personalData,
                timestamp: new Date().toISOString()
            }));
        }, 2000);
    }

    // Navigation functions
    window.nextStep = function(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        document.getElementById('step' + stepNumber).classList.add('active');

        // Update progress
        updateProgress(stepNumber);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.prevStep = function(stepNumber) {
        nextStep(stepNumber);
    };

    // Update progress indicators
    function updateProgress(currentStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    // Prevent accidental navigation away
    window.addEventListener('beforeunload', function(e) {
        const currentStep = document.querySelector('.form-step.active');
        if (currentStep && currentStep.id !== 'step4' && currentStep.id !== 'step1') {
            e.preventDefault();
            e.returnValue = '';
        }
    });

})();
