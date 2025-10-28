let allCarsData = [];
        let filteredCarsData = [];
        let likedCars = [];
        let activeFilters = {
            brands: [],
            models: [],
            variants: [],
            selectedBrandModels: {},
            selectedModelVariants: {},
            fuelTypes: [],
            bodyTypes: [],
            gearTypes: [],
            transmissions: [],
            conditions: [],
            equipments: [],
            colors: [],
            minYear: null,
            maxYear: null,
            minPrice: null,
            maxPrice: null,
            minMileage: null,
            maxMileage: null,
            minEngine: null,
            maxEngine: null
        };
        let brandModelHierarchy = {};
        let modelVariantHierarchy = {};
        let currentSelectedBrand = null;
        let currentSelectedModel = null;

        let currentPage = 1;
        const carsPerPage = 12;
        let displayedCars = 0;

        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const totalSlides = slides.length;
        let videoPlayed = false;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            if (slides[index]) {
                slides[index].classList.add('active');
            }
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }

            const currentSlideElement = slides[index];
            const video = currentSlideElement.querySelector('video');
            
            if (video && index === 0 && !videoPlayed) {
                stopAutoPlay();
                video.currentTime = 0;
                video.play();
                
                video.onended = function() {
                    videoPlayed = true;
                    nextSlide();
                    startAutoPlay();
                };
            } else if (video && index === 0 && videoPlayed) {
                video.play();
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        let autoPlayInterval;

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 4000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        document.addEventListener('DOMContentLoaded', function() {
            const nextBtn = document.getElementById('nextBtn');
            const prevBtn = document.getElementById('prevBtn');
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    stopAutoPlay();
                    nextSlide();
                    startAutoPlay();
                });
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    stopAutoPlay();
                    prevSlide();
                    startAutoPlay();
                });
            }
            
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    stopAutoPlay();
                    currentSlide = index;
                    showSlide(currentSlide);
                    startAutoPlay();
                });
            });
            
            startAutoPlay();
            
            const carousel = document.querySelector('.hero-carousel');
            if (carousel) {
                carousel.addEventListener('mouseenter', stopAutoPlay);
                carousel.addEventListener('mouseleave', startAutoPlay);
            }

            loadLikedCars();
            
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreCars);
            }
        });

        const accountLink = document.getElementById('accountLink');
        const mobileAccountLink = document.getElementById('mobileAccountLink');
        const accountModal = document.getElementById('accountModal');
        const closeAccountModal = document.getElementById('closeAccountModal');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const showSignupLink = document.getElementById('showSignupLink');
        const showLoginLink = document.getElementById('showLoginLink');
        const formTitle = document.getElementById('formTitle');

        function showAccountModal(e) {
            e.preventDefault();
            accountModal.style.display = 'flex';
            
            if (mobileDropdown && mobileDropdown.classList.contains('show')) {
                closeMobileMenu();
            }
        }

        if (accountLink) {
            accountLink.addEventListener('click', showAccountModal);
        }

        if (mobileAccountLink) {
            mobileAccountLink.addEventListener('click', showAccountModal);
        }

        if (closeAccountModal) {
            closeAccountModal.addEventListener('click', function() {
                accountModal.style.display = 'none';
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === accountModal) {
                accountModal.style.display = 'none';
            }
        });

        if (showSignupLink) {
            showSignupLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                formTitle.textContent = 'Sign Up';
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
                formTitle.textContent = 'Login';
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe').checked;
                
                console.log('Login attempt:', { username, rememberMe });
                
                alert(`Welcome, ${username}!`);
                
                accountModal.style.display = 'none';
                loginForm.reset();
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('signupUsername').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                
                console.log('Signup attempt:', { username, email });
                
                alert(`Account created successfully! Welcome, ${username}!`);
                
                accountModal.style.display = 'none';
                signupForm.reset();
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
                formTitle.textContent = 'Login';
            });
        }

        const searchBox = document.getElementById('search-box');
        const searchIcon = document.getElementById('searchIcon');
        const filterIcon = document.getElementById('filterIcon');
        const searchDropdown = document.getElementById('searchDropdown');
        const filterDropdown = document.getElementById('filterDropdown');

        const mobileToggle = document.getElementById('mobileToggle');
        const mobileDropdown = document.getElementById('mobileDropdown');

        function closeMobileMenu() {
            if (mobileDropdown && mobileToggle) {
                mobileDropdown.classList.remove('show');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
                mobileToggle.classList.remove('active');
            }
        }

        if (mobileToggle && mobileDropdown) {
            mobileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileDropdown.classList.toggle('show');
                const icon = mobileToggle.querySelector('i');
                
                if (mobileDropdown.classList.contains('show')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                    mobileToggle.classList.add('active');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                    mobileToggle.classList.remove('active');
                }
            });

            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !mobileDropdown.contains(e.target)) {
                    closeMobileMenu();
                }
            });

            mobileDropdown.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    closeMobileMenu();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    closeMobileMenu();
                    if (searchBox && searchBox.classList.contains('expanded')) {
                        searchBox.classList.remove('expanded');
                        searchIcon.classList.remove('active');
                    }
                }
            });
        }

        function isMobileView() {
            return window.innerWidth <= 768;
        }

        function toggleMobileSearch() {
            if (isMobileView()) {
                const isExpanded = searchBox.classList.contains('expanded');
                
                if (isExpanded) {
                    const searchTerm = searchBox.value.trim().toLowerCase();
                    if (searchTerm) {
                        performSearch(searchTerm);
                        hideSearchDropdown();
                    } else {
                        searchBox.classList.remove('expanded');
                        searchIcon.classList.remove('active');
                        hideSearchDropdown();
                    }
                } else {
                    searchBox.classList.add('expanded');
                    searchIcon.classList.add('active');
                    setTimeout(() => {
                        searchBox.focus();
                    }, 100);
                }
            } else {
                const searchTerm = searchBox.value.trim().toLowerCase();
                if (searchTerm) {
                    performSearch(searchTerm);
                    hideSearchDropdown();
                }
            }
        }

        function handleOutsideClick(e) {
            if (isMobileView() && searchBox.classList.contains('expanded')) {
                if (!searchBox.contains(e.target) && 
                    !searchIcon.contains(e.target) && 
                    !searchDropdown.contains(e.target)) {
                    searchBox.classList.remove('expanded');
                    searchIcon.classList.remove('active');
                    hideSearchDropdown();
                }
            }
        }

        function buildBrandModelHierarchy() {
            brandModelHierarchy = {};
            modelVariantHierarchy = {};
            
            allCarsData.forEach(car => {
                if (!brandModelHierarchy[car.Marks]) {
                    brandModelHierarchy[car.Marks] = new Set();
                }
                brandModelHierarchy[car.Marks].add(car.Model);
                
                const modelKey = `${car.Marks}|${car.Model}`;
                if (!modelVariantHierarchy[modelKey]) {
                    modelVariantHierarchy[modelKey] = new Set();
                }
                modelVariantHierarchy[modelKey].add(car.Name);
            });
            
            Object.keys(brandModelHierarchy).forEach(brand => {
                brandModelHierarchy[brand] = Array.from(brandModelHierarchy[brand]).sort();
            });
            
            Object.keys(modelVariantHierarchy).forEach(modelKey => {
                modelVariantHierarchy[modelKey] = Array.from(modelVariantHierarchy[modelKey]).sort();
            });
        }

        function showSearchResults(searchTerm) {
            const results = [];
            const term = searchTerm.toLowerCase();
            
            allCarsData.forEach(car => {
                let relevance = 0;
                let matchType = '';
                let matchedText = '';
                
                if (car.Marks.toLowerCase().includes(term)) {
                    relevance += car.Marks.toLowerCase() === term ? 100 : 50;
                    matchType = 'brand';
                    matchedText = car.Marks;
                }
                if (car.Model.toLowerCase().includes(term)) {
                    relevance += car.Model.toLowerCase() === term ? 100 : 50;
                    matchType = matchType ? 'brand-model' : 'model';
                    matchedText = `${car.Marks} ${car.Model}`;
                }
                if (car.Name.toLowerCase().includes(term)) {
                    relevance += 40;
                    matchedText = car.Name;
                }
                if (car.BanType.toLowerCase().includes(term)) relevance += 30;
                if (car.FuelType.toLowerCase().includes(term)) relevance += 30;
                if (car.Color.toLowerCase().includes(term)) relevance += 20;
                if (car.Year.toString().includes(term)) relevance += 25;
                
                if (relevance > 0) {
                    results.push({
                        car: car,
                        relevance: relevance,
                        matchType: matchType,
                        matchedText: matchedText
                    });
                }
            });
            
            results.sort((a, b) => b.relevance - a.relevance);
            
            if (results.length > 0) {
                const uniqueResults = [];
                const seen = new Set();
                
                results.forEach(result => {
                    const key = `${result.car.Marks}-${result.car.Model}-${result.car.Name}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueResults.push(result);
                    }
                });
                
                const html = uniqueResults.slice(0, 8).map(result => 
                    `<div class="search-result" onclick="selectSearchResult('${escapeHtml(result.car.Marks)}', '${escapeHtml(result.car.Model)}', '${escapeHtml(result.car.Name)}')">
                        <strong>${result.car.Marks} ${result.car.Model}</strong><br>
                        <small>${result.car.Name} (${result.car.Year}) - $${result.car.Price.toLocaleString()}</small>
                    </div>`
                ).join('');
                
                searchDropdown.innerHTML = html;
            } else {
                searchDropdown.innerHTML = '<div class="no-search-results">No results found</div>';
            }
            
            searchDropdown.style.display = 'block';
        }

        function escapeHtml(text) {
            return text.replace(/'/g, "\\'");
        }

        function selectSearchResult(brand, model, name) {
            searchBox.value = name || `${brand} ${model}`;
            performSearch((name || `${brand} ${model}`).toLowerCase());
            hideSearchDropdown();
        }

        function performSearch(searchTerm) {
            const results = allCarsData.filter(car => 
                car.Marks.toLowerCase().includes(searchTerm) ||
                car.Model.toLowerCase().includes(searchTerm) ||
                car.Name.toLowerCase().includes(searchTerm) ||
                car.BanType.toLowerCase().includes(searchTerm) ||
                car.FuelType.toLowerCase().includes(searchTerm) ||
                car.Color.toLowerCase().includes(searchTerm) ||
                car.Year.toString().includes(searchTerm) ||
                car.Condition.toLowerCase().includes(searchTerm) ||
                car.Equipment.toLowerCase().includes(searchTerm)
            );
            
            renderCars(results);
        }

        searchIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileSearch();
        });

        searchBox.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            if (searchTerm.length >= 2) {
                showSearchResults(searchTerm);
            } else if (searchTerm.length === 0) {
                hideSearchDropdown();
                renderCars(filteredCarsData);
            }
        });

        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim().toLowerCase();
                if (searchTerm) {
                    performSearch(searchTerm);
                    hideSearchDropdown();
                }
            }
        });

        filterIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (filterDropdown.style.display === 'block') {
                hideFilterDropdown();
            } else {
                hideSearchDropdown();
                showFilterDropdown();
            }
        });

        document.addEventListener('click', function(e) {
            if (!searchBox.contains(e.target) && !searchDropdown.contains(e.target) && !searchIcon.contains(e.target)) {
                hideSearchDropdown();
            }
            if (!filterIcon.contains(e.target) && !filterDropdown.contains(e.target)) {
                hideFilterDropdown();
            }
            const accountDropdown = document.getElementById('accountDropdown');
            if (accountDropdown && (searchBox.contains(e.target) || filterIcon.contains(e.target))) {
                accountDropdown.classList.remove('show');
            }
            handleOutsideClick(e);
        });

        function hideSearchDropdown() {
            searchDropdown.style.display = 'none';
        }

        function showFilterDropdown() {
            buildBrandModelHierarchy();
            generateFilterOptions();
            filterDropdown.style.display = 'block';
        }

        function hideFilterDropdown() {
            filterDropdown.style.display = 'none';
        }

        function generateFilterOptions() {
            generateBrandOptions();
            
            const fuelTypes = [...new Set(allCarsData.map(car => car.FuelType))].sort();
            const fuelContainer = document.getElementById('fuelOptions');
            fuelContainer.innerHTML = fuelTypes.map(fuel => 
                `<span class="filter-option ${activeFilters.fuelTypes.includes(fuel) ? 'active' : ''}" 
                       data-type="fuel" data-value="${fuel}">${fuel}</span>`
            ).join('');
            
            const bodyTypes = [...new Set(allCarsData.map(car => car.BanType))].sort();
            const bodyContainer = document.getElementById('bodyOptions');
            bodyContainer.innerHTML = bodyTypes.map(body => 
                `<span class="filter-option ${activeFilters.bodyTypes.includes(body) ? 'active' : ''}" 
                       data-type="body" data-value="${body}">${body}</span>`
            ).join('');
            
            const gearTypes = [...new Set(allCarsData.map(car => car.GearType))].sort();
            const gearContainer = document.getElementById('gearOptions');
            gearContainer.innerHTML = gearTypes.map(gear => 
                `<span class="filter-option ${activeFilters.gearTypes.includes(gear) ? 'active' : ''}" 
                       data-type="gear" data-value="${gear}">${gear}</span>`
            ).join('');
            
            const transmissions = [...new Set(allCarsData.map(car => car.Transmission))].sort();
            const transmissionContainer = document.getElementById('transmissionOptions');
            transmissionContainer.innerHTML = transmissions.map(trans => 
                `<span class="filter-option ${activeFilters.transmissions.includes(trans) ? 'active' : ''}" 
                       data-type="transmission" data-value="${trans}">${trans}</span>`
            ).join('');
            
            const conditions = [...new Set(allCarsData.map(car => car.Condition))].sort();
            const conditionContainer = document.getElementById('conditionOptions');
            conditionContainer.innerHTML = conditions.map(cond => 
                `<span class="filter-option ${activeFilters.conditions.includes(cond) ? 'active' : ''}" 
                       data-type="condition" data-value="${cond}">${cond}</span>`
            ).join('');
            
            const equipmentSet = new Set();
            allCarsData.forEach(car => {
                if (car.Equipment) {
                    const items = car.Equipment.split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
                    items.forEach(item => equipmentSet.add(item));
                }
            });
            const equipments = Array.from(equipmentSet).sort();
            const equipmentContainer = document.getElementById('equipmentOptions');
            if (equipmentContainer) {
                equipmentContainer.innerHTML = equipments.slice(0, 20).map(equip => 
                    `<span class="filter-option ${activeFilters.equipments.includes(equip) ? 'active' : ''}" 
                           data-type="equipment" data-value="${equip}">${equip}</span>`
                ).join('');
            }
            
            // Colors
            const colors = [...new Set(allCarsData.map(car => car.Color))].sort();
            const colorContainer = document.getElementById('colorOptions');
            if (colorContainer) {
                colorContainer.innerHTML = colors.map(color => 
                    `<span class="filter-option ${activeFilters.colors.includes(color) ? 'active' : ''}" 
                           data-type="color" data-value="${color}">${color}</span>`
                ).join('');
            }
            
            // Set range input values
            document.getElementById('minYear').value = activeFilters.minYear || '';
            document.getElementById('maxYear').value = activeFilters.maxYear || '';
            document.getElementById('minPrice').value = activeFilters.minPrice || '';
            document.getElementById('maxPrice').value = activeFilters.maxPrice || '';
            document.getElementById('minMileage').value = activeFilters.minMileage || '';
            document.getElementById('maxMileage').value = activeFilters.maxMileage || '';
            document.getElementById('minEngine').value = activeFilters.minEngine || '';
            document.getElementById('maxEngine').value = activeFilters.maxEngine || '';
            
            // Add event listeners for filter options
            document.querySelectorAll('.filter-option').forEach(option => {
                option.addEventListener('click', function() {
                    const type = this.dataset.type;
                    const value = this.dataset.value;
                    
                    this.classList.toggle('active');
                    
                    if (type === 'fuel') {
                        toggleFilterValue(activeFilters.fuelTypes, value);
                    } else if (type === 'body') {
                        toggleFilterValue(activeFilters.bodyTypes, value);
                    } else if (type === 'gear') {
                        toggleFilterValue(activeFilters.gearTypes, value);
                    } else if (type === 'transmission') {
                        toggleFilterValue(activeFilters.transmissions, value);
                    } else if (type === 'condition') {
                        toggleFilterValue(activeFilters.conditions, value);
                    } else if (type === 'equipment') {
                        toggleFilterValue(activeFilters.equipments, value);
                    } else if (type === 'color') {
                        toggleFilterValue(activeFilters.colors, value);
                    }
                });
            });
        }

        function generateBrandOptions() {
            const brandContainer = document.getElementById('brandOptions');
            if (!brandContainer) {
                return;
            }
            
            const brands = Object.keys(brandModelHierarchy).sort();
            
            let html = '';
            brands.forEach(brand => {
                const isSelected = activeFilters.brands.includes(brand);
                html += `<span class="filter-option brand-option ${isSelected ? 'active' : ''}" 
                               data-type="brand" data-value="${brand}">${brand}</span>`;
            });
            
            brandContainer.innerHTML = html;
            
            document.querySelectorAll('.brand-option').forEach(option => {
                option.addEventListener('click', function() {
                    const brand = this.dataset.value;
                    
                    // Deselect all other brands first (single brand selection)
                    document.querySelectorAll('.brand-option').forEach(opt => {
                        if (opt !== this) {
                            opt.classList.remove('active');
                        }
                    });
                    
                    const wasActive = this.classList.contains('active');
                    this.classList.toggle('active');
                    
                    if (wasActive) {
                        // Deselecting brand
                        const brandIndex = activeFilters.brands.indexOf(brand);
                        if (brandIndex > -1) {
                            activeFilters.brands.splice(brandIndex, 1);
                        }
                        if (activeFilters.selectedBrandModels[brand]) {
                            delete activeFilters.selectedBrandModels[brand];
                        }
                        activeFilters.models = [];
                        activeFilters.variants = [];
                        activeFilters.selectedModelVariants = {};
                        currentSelectedBrand = null;
                        currentSelectedModel = null;
                        hideModelOptions();
                        hideVariantSection();
                        updateSelectedModelDisplay();
                    } else {
                        // Selecting new brand
                        activeFilters.brands = [brand];
                        activeFilters.models = [];
                        activeFilters.variants = [];
                        activeFilters.selectedBrandModels = {};
                        activeFilters.selectedModelVariants = {};
                        currentSelectedBrand = brand;
                        currentSelectedModel = null;
                        hideVariantSection();
                        showModelOptions(brand);
                    }
                });
            });
        }

        function showModelOptions(brand) {
            const models = brandModelHierarchy[brand];
            if (!models || models.length === 0) return;
            
            const modelSection = document.getElementById('modelSection');
            const modelContainer = document.getElementById('modelOptions');
            
            const selectedModelsForBrand = activeFilters.selectedBrandModels[brand] || [];
            
            // Models are already deduplicated in brandModelHierarchy (using Set)
            let html = '';
            models.forEach(model => {
                const isSelected = selectedModelsForBrand.includes(model);
                
                html += `<span class="filter-option model-option ${isSelected ? 'active' : ''}" 
                               data-brand="${brand}" data-model="${model}">${model}</span>`;
            });
            
            modelContainer.innerHTML = html;
            modelSection.style.display = 'block';
            
            document.querySelectorAll('.model-option').forEach(option => {
                option.addEventListener('click', function() {
                    const brand = this.dataset.brand;
                    const model = this.dataset.model;
                    
                    // Toggle active state (allow multiple selections)
                    this.classList.toggle('active');
                    
                    if (!activeFilters.selectedBrandModels[brand]) {
                        activeFilters.selectedBrandModels[brand] = [];
                    }
                    
                    const modelIndex = activeFilters.selectedBrandModels[brand].indexOf(model);
                    if (modelIndex > -1) {
                        // Remove model from selection
                        activeFilters.selectedBrandModels[brand].splice(modelIndex, 1);
                        // Hide variants for this model
                        hideVariantsForModel(brand, model);
                    } else {
                        // Add model to selection
                        activeFilters.selectedBrandModels[brand].push(model);
                        // Show variants for this model - rebuild variant section
                        rebuildVariantSection();
                    }
                    
                    // Update global models array
                    activeFilters.models = [];
                    Object.values(activeFilters.selectedBrandModels).forEach(models => {
                        activeFilters.models.push(...models);
                    });
                    
                    // Update selected model display
                    updateSelectedModelDisplay();
                });
            });
        }

        function rebuildVariantSection() {
            const variantSection = document.getElementById('variantSection');
            const variantContainer = document.getElementById('variantOptions');
            
            // Collect all variants for all selected models
            let allVariantsHtml = '';
            let hasVariants = false;
            
            if (activeFilters.brands.length > 0) {
                const brand = activeFilters.brands[0];
                const selectedModels = activeFilters.selectedBrandModels[brand] || [];
                
                selectedModels.forEach(model => {
                    const modelKey = `${brand}|${model}`;
                    const variants = modelVariantHierarchy[modelKey];
                    
                    if (variants && variants.length > 0) {
                        hasVariants = true;
                        const selectedVariantsForModel = activeFilters.selectedModelVariants[modelKey] || [];
                        
                        variants.forEach(variant => {
                            const isSelected = selectedVariantsForModel.includes(variant);
                            allVariantsHtml += `<span class="filter-option variant-option ${isSelected ? 'active' : ''}" 
                                           data-brand="${brand}" data-model="${model}" data-variant="${variant}">${variant}</span>`;
                        });
                    }
                });
            }
            
            if (hasVariants) {
                variantContainer.innerHTML = allVariantsHtml;
                variantSection.style.display = 'block';
                
                // Add event listeners for variant options
                document.querySelectorAll('.variant-option').forEach(option => {
                    option.addEventListener('click', function() {
                        const brand = this.dataset.brand;
                        const model = this.dataset.model;
                        const variant = this.dataset.variant;
                        const modelKey = `${brand}|${model}`;
                        
                        this.classList.toggle('active');
                        
                        if (!activeFilters.selectedModelVariants[modelKey]) {
                            activeFilters.selectedModelVariants[modelKey] = [];
                        }
                        
                        const variantIndex = activeFilters.selectedModelVariants[modelKey].indexOf(variant);
                        if (variantIndex > -1) {
                            activeFilters.selectedModelVariants[modelKey].splice(variantIndex, 1);
                        } else {
                            activeFilters.selectedModelVariants[modelKey].push(variant);
                        }
                        
                        // Update global variants array
                        activeFilters.variants = [];
                        Object.values(activeFilters.selectedModelVariants).forEach(variants => {
                            activeFilters.variants.push(...variants);
                        });
                        
                        updateSelectedModelDisplay();
                    });
                });
            } else {
                variantSection.style.display = 'none';
            }
        }

        function hideVariantsForModel(brand, model) {
            const modelKey = `${brand}|${model}`;
            delete activeFilters.selectedModelVariants[modelKey];
            
            // Update global variants array
            activeFilters.variants = [];
            Object.values(activeFilters.selectedModelVariants).forEach(variants => {
                activeFilters.variants.push(...variants);
            });
            
            // Rebuild variant section with remaining selected models
            rebuildVariantSection();
        }

        function updateSelectedModelDisplay() {
            // Function kept for compatibility but does nothing
        }

        function hideModelOptions() {
            const modelSection = document.getElementById('modelSection');
            if (modelSection && activeFilters.brands.length === 0) {
                modelSection.style.display = 'none';
            }
        }

        function hideVariantSection() {
            const variantSection = document.getElementById('variantSection');
            if (variantSection) {
                variantSection.style.display = 'none';
            }
        }

        function toggleFilterValue(filterArray, value) {
            const index = filterArray.indexOf(value);
            if (index > -1) {
                filterArray.splice(index, 1);
            } else {
                filterArray.push(value);
            }
        }

        document.getElementById('applyFilters').addEventListener('click', function() {
            const minYear = document.getElementById('minYear').value;
            const maxYear = document.getElementById('maxYear').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            const minMileage = document.getElementById('minMileage').value;
            const maxMileage = document.getElementById('maxMileage').value;
            const minEngine = document.getElementById('minEngine').value;
            const maxEngine = document.getElementById('maxEngine').value;
            
            activeFilters.minYear = minYear ? parseInt(minYear) : null;
            activeFilters.maxYear = maxYear ? parseInt(maxYear) : null;
            activeFilters.minPrice = minPrice ? parseFloat(minPrice) : null;
            activeFilters.maxPrice = maxPrice ? parseFloat(maxPrice) : null;
            activeFilters.minMileage = minMileage ? parseFloat(minMileage) : null;
            activeFilters.maxMileage = maxMileage ? parseFloat(maxMileage) : null;
            activeFilters.minEngine = minEngine ? parseFloat(minEngine) : null;
            activeFilters.maxEngine = maxEngine ? parseFloat(maxEngine) : null;
            
            applyFilters();
            hideFilterDropdown();
        });

        document.getElementById('clearFilters').addEventListener('click', function() {
            activeFilters = {
                brands: [],
                models: [],
                variants: [],
                selectedBrandModels: {},
                selectedModelVariants: {},
                fuelTypes: [],
                bodyTypes: [],
                gearTypes: [],
                transmissions: [],
                conditions: [],
                equipments: [],
                colors: [],
                minYear: null,
                maxYear: null,
                minPrice: null,
                maxPrice: null,
                minMileage: null,
                maxMileage: null,
                minEngine: null,
                maxEngine: null
            };
            
            currentSelectedBrand = null;
            currentSelectedModel = null;
            searchBox.value = '';
            
            filteredCarsData = [...allCarsData];
            renderCars(filteredCarsData);
            
            hideModelOptions();
            hideVariantSection();
            updateSelectedModelDisplay();
            // Regenerate filter options from current JSON data
            buildBrandModelHierarchy();
            generateFilterOptions();
        });

        function applyFilters() {
            let filtered = [...allCarsData];
            
            // Apply variant filter (most specific)
            if (activeFilters.variants.length > 0) {
                filtered = filtered.filter(car => activeFilters.variants.includes(car.Name));
            } else if (activeFilters.models.length > 0) {
                // Apply model filter
                filtered = filtered.filter(car => {
                    const selectedModelsForBrand = activeFilters.selectedBrandModels[car.Marks];
                    if (selectedModelsForBrand && selectedModelsForBrand.length > 0) {
                        return selectedModelsForBrand.includes(car.Model);
                    }
                    return false;
                });
            } else if (activeFilters.brands.length > 0) {
                // Apply brand filter
                filtered = filtered.filter(car => activeFilters.brands.includes(car.Marks));
            }
            
            // Apply fuel type filter
            if (activeFilters.fuelTypes.length > 0) {
                filtered = filtered.filter(car => activeFilters.fuelTypes.includes(car.FuelType));
            }
            
            // Apply body type filter
            if (activeFilters.bodyTypes.length > 0) {
                filtered = filtered.filter(car => activeFilters.bodyTypes.includes(car.BanType));
            }
            
            // Apply gear type filter
            if (activeFilters.gearTypes.length > 0) {
                filtered = filtered.filter(car => activeFilters.gearTypes.includes(car.GearType));
            }
            
            // Apply transmission filter
            if (activeFilters.transmissions.length > 0) {
                filtered = filtered.filter(car => activeFilters.transmissions.includes(car.Transmission));
            }
            
            // Apply condition filter
            if (activeFilters.conditions.length > 0) {
                filtered = filtered.filter(car => activeFilters.conditions.includes(car.Condition));
            }
            
            // Apply equipment filter
            if (activeFilters.equipments.length > 0) {
                filtered = filtered.filter(car => {
                    if (!car.Equipment) return false;
                    return activeFilters.equipments.some(equip => car.Equipment.includes(equip));
                });
            }
            
            // Apply color filter
            if (activeFilters.colors.length > 0) {
                filtered = filtered.filter(car => activeFilters.colors.includes(car.Color));
            }
            
            // Apply year range filter
            if (activeFilters.minYear) {
                filtered = filtered.filter(car => parseInt(car.Year) >= activeFilters.minYear);
            }
            if (activeFilters.maxYear) {
                filtered = filtered.filter(car => parseInt(car.Year) <= activeFilters.maxYear);
            }
            
            // Apply price range filter
            if (activeFilters.minPrice) {
                filtered = filtered.filter(car => parseFloat(car.Price) >= activeFilters.minPrice);
            }
            if (activeFilters.maxPrice) {
                filtered = filtered.filter(car => parseFloat(car.Price) <= activeFilters.maxPrice);
            }
            
            // Apply mileage range filter
            if (activeFilters.minMileage) {
                filtered = filtered.filter(car => {
                    const mileage = parseFloat(car.Milage.toString().replace(/[^0-9.]/g, ''));
                    return mileage >= activeFilters.minMileage;
                });
            }
            if (activeFilters.maxMileage) {
                filtered = filtered.filter(car => {
                    const mileage = parseFloat(car.Milage.toString().replace(/[^0-9.]/g, ''));
                    return mileage <= activeFilters.maxMileage;
                });
            }
            
            // Apply engine capacity range filter
            if (activeFilters.minEngine) {
                filtered = filtered.filter(car => {
                    const engine = parseFloat(car.EngineCapacity.toString().replace(/[^0-9.]/g, ''));
                    return engine >= activeFilters.minEngine;
                });
            }
            if (activeFilters.maxEngine) {
                filtered = filtered.filter(car => {
                    const engine = parseFloat(car.EngineCapacity.toString().replace(/[^0-9.]/g, ''));
                    return engine <= activeFilters.maxEngine;
                });
            }
            
            filteredCarsData = filtered;
            renderCars(filteredCarsData);
        }

        // Like system functions
        function updateLikeCounter() {
            const counter = document.getElementById('likeCounter');
            if (counter) {
                counter.textContent = likedCars.length;
            }
        }

        function saveLikedCars() {
            // Store full car data in sessionStorage for cross-page sync
            sessionStorage.setItem('likedCars', JSON.stringify(likedCars));
            // Also keep in window for current page
            window.likedCarsData = likedCars;
        }

        function loadLikedCars() {
            // Load from sessionStorage if exists
            const storedLikedCars = sessionStorage.getItem('likedCars');
            if (storedLikedCars) {
                try {
                    const parsedCars = JSON.parse(storedLikedCars);
                    // Match stored cars with current data
                    likedCars = allCarsData.filter(car => 
                        parsedCars.some(likedCar => 
                            likedCar.Marks === car.Marks && 
                            likedCar.Model === car.Model && 
                            likedCar.Year === car.Year
                        )
                    );
                    window.likedCarsData = likedCars;
                    updateLikeCounter();
                } catch (e) {
                    console.error('Error loading liked cars:', e);
                }
            }
        }

        function isCarLiked(car) {
            return likedCars.some(likedCar => 
                likedCar.Marks === car.Marks && 
                likedCar.Model === car.Model && 
                likedCar.Year === car.Year
            );
        }

        function toggleLike(car, heartIcon) {
            const carIndex = likedCars.findIndex(likedCar => 
                likedCar.Marks === car.Marks && 
                likedCar.Model === car.Model && 
                likedCar.Year === car.Year
            );
            
            if (carIndex > -1) {
                // Remove from liked
                likedCars.splice(carIndex, 1);
                heartIcon.classList.remove('liked');
            } else {
                // Add to liked
                likedCars.push(car);
                heartIcon.classList.add('liked');
            }
            
            updateLikeCounter();
            saveLikedCars();
        }

        // Show liked cars modal
        const likeLink = document.getElementById('likeLink');
        const mobileLikeLink = document.getElementById('mobileLikeLink');
        const likedModal = document.getElementById('likedModal');
        const closeLikedModal = document.getElementById('closeLikedModal');

        if (likeLink) {
            likeLink.addEventListener('click', function(e) {
                e.preventDefault();
                showLikedCarsModal();
            });
        }

        if (mobileLikeLink) {
            mobileLikeLink.addEventListener('click', function(e) {
                e.preventDefault();
                showLikedCarsModal();
                // Close mobile menu after clicking
                if (mobileDropdown && mobileDropdown.classList.contains('show')) {
                    closeMobileMenu();
                }
            });
        }

        if (closeLikedModal) {
            closeLikedModal.addEventListener('click', function() {
                likedModal.style.display = 'none';
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === likedModal) {
                likedModal.style.display = 'none';
            }
        });

        function showLikedCarsModal() {
            const likedCount = document.getElementById('likedCount');
            const likedCarsList = document.getElementById('likedCarsList');
            const clearAllBtn = document.getElementById('clearAllLiked');
            
            likedCount.textContent = likedCars.length;
            
            // Show/hide clear all button based on liked cars count
            if (likedCars.length > 0) {
                clearAllBtn.style.display = 'flex';
            } else {
                clearAllBtn.style.display = 'none';
            }
            
            if (likedCars.length === 0) {
                likedCarsList.innerHTML = '<div class="no-results">No liked cars yet. Start exploring and like your favorites!</div>';
            } else {
                likedCarsList.innerHTML = '';
                likedCars.forEach((car, index) => {
                    const card = document.createElement('div');
                    card.classList.add('car-card');
                    card.style.cursor = 'pointer';
                    
                    card.innerHTML = `
                        <div class="car-image-container">
                            <img src="${car.image}" alt="${car.Marks} ${car.Model}" 
                                 onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop'">
                            <button class="delete-btn" data-delete-index="${index}" title="Remove from favorites">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div class="car-info">
                            <h3 class="car-title">${car.Marks} ${car.Model}</h3>
                            <div class="car-details">
                                <div class="car-detail-item">
                                    <i class="fa-solid fa-calendar"></i>
                                    <span>${car.Year}</span>
                                </div>
                                <div class="car-detail-item">
                                    <i class="fa-solid fa-gas-pump"></i>
                                    <span>${car.FuelType}</span>
                                </div>
                                <div class="car-detail-item">
                                    <i class="fa-solid fa-road"></i>
                                    <span>${car.Milage}</span>
                                </div>
                            </div>
                            <div class="car-price">$${typeof car.Price === 'number' ? car.Price.toLocaleString() : car.Price}</div>
                            <div class="card-actions">
                                <i class="fa-solid fa-heart heart-icon liked" data-liked-index="${index}"></i>
                                <button class="buy-btn" data-buy-liked="${index}">Buy Now</button>
                            </div>
                        </div>
                    `;
                    
                    likedCarsList.appendChild(card);
                    
                    // Make liked card clickable to navigate to detail page
                    card.addEventListener('click', function(e) {
                        // Don't navigate if clicking on delete, heart, or buy button
                        if (!e.target.classList.contains('delete-btn') &&
                            !e.target.classList.contains('heart-icon') && 
                            !e.target.classList.contains('buy-btn') &&
                            !e.target.closest('.delete-btn') &&
                            !e.target.closest('.heart-icon') &&
                            !e.target.closest('.buy-btn')) {
                            // Store car data and navigate
                            sessionStorage.setItem('selectedCar', JSON.stringify(car));
                            sessionStorage.setItem('selectedCarIndex', index);
                            window.location.href = 'car-details.html';
                        }
                    });
                });
                
                // Add event listeners for delete buttons (no confirmation)
                document.querySelectorAll('[data-delete-index]').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.dataset.deleteIndex);
                        removeLikedCarDirectly(index);
                    });
                });
                
                // Add event listeners for heart icons (remove from liked)
                document.querySelectorAll('[data-liked-index]').forEach(icon => {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.dataset.likedIndex);
                        removeLikedCarDirectly(index);
                    });
                });
                
                // Add event listeners for buy buttons in liked cars
                document.querySelectorAll('[data-buy-liked]').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = parseInt(this.dataset.buyLiked);
                        const car = likedCars[index];
                        handleBuyNow(car);
                    });
                });
            }
            
            likedModal.style.display = 'flex';
        }

        // Direct removal function without confirmation
        function removeLikedCarDirectly(index) {
            likedCars.splice(index, 1);
            updateLikeCounter();
            saveLikedCars();
            showLikedCarsModal(); // Refresh modal
            updateHeartIconsInMainView();
        }

        // Clear all liked cars function (keeps confirmation for bulk action)
        function clearAllLikedCars() {
            if (confirm('Are you sure you want to remove all cars from your favorites?')) {
                likedCars = [];
                updateLikeCounter();
                saveLikedCars();
                showLikedCarsModal();
                updateHeartIconsInMainView();
            }
        }

        // Show car details inline within the liked modal
        function showInlineCarDetails(car, carIndex) {
            const likedCarsList = document.getElementById('likedCarsList');
            
            // Check if details are already shown for this car
            const existingDetails = document.getElementById(`details-${carIndex}`);
            if (existingDetails) {
                existingDetails.remove();
                return;
            }
            
            // Remove any other open details
            document.querySelectorAll('.inline-details').forEach(detail => detail.remove());
            
            // Create inline details element
            const detailsElement = document.createElement('div');
            detailsElement.classList.add('inline-details');
            detailsElement.id = `details-${carIndex}`;
            
            detailsElement.innerHTML = `
                <div class="inline-details-content">
                    <div class="details-header">
                        <h3>${car.Marks} ${car.Model} - Full Details</h3>
                        <button class="close-details-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div class="details-grid">
                        <div class="detail-column">
                            <div class="detail-item">
                                <strong>Full Name:</strong>
                                <span>${car.Name}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Year:</strong>
                                <span>${car.Year}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Fuel Type:</strong>
                                <span>${car.FuelType}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Body Type:</strong>
                                <span>${car.BanType}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Gear Type:</strong>
                                <span>${car.GearType}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Mileage:</strong>
                                <span>${car.Milage}</span>
                            </div>
                        </div>
                        <div class="detail-column">
                            <div class="detail-item">
                                <strong>Condition:</strong>
                                <span>${car.Condition}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Engine Capacity:</strong>
                                <span>${car.EngineCapacity}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Power:</strong>
                                <span>${car.PowerHp}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Transmission:</strong>
                                <span>${car.Transmission}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Color:</strong>
                                <span>${car.Color}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Price:</strong>
                                <span class="price-highlight">$${typeof car.Price === 'number' ? car.Price.toLocaleString() : car.Price}</span>
                            </div>
                        </div>
                    </div>
                    <div class="equipment-section">
                        <strong>Equipment:</strong>
                        <p>${car.Equipment}</p>
                    </div>
                </div>
            `;
            
            // Find the card and insert details after it
            const cards = likedCarsList.querySelectorAll('.car-card');
            const targetCard = cards[carIndex];
            if (targetCard) {
                targetCard.insertAdjacentElement('afterend', detailsElement);
                
                // Scroll to details
                detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function updateHeartIconsInMainView() {
            document.querySelectorAll('.heart-icon').forEach(icon => {
                const carIndex = parseInt(icon.dataset.index);
                const car = filteredCarsData[carIndex];
                if (car) {
                    if (isCarLiked(car)) {
                        icon.classList.add('liked');
                    } else {
                        icon.classList.remove('liked');
                    }
                }
            });
        }

        // Load More functionality
        function loadMoreCars() {
            currentPage++;
            renderCars(filteredCarsData, true);
        }

        function renderCars(data, append = false) {
            const container = document.getElementById('carList');
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            
            if (!append) {
                container.innerHTML = '';
                currentPage = 1;
                displayedCars = 0;
            }
            
            const isFiltered = data.length !== allCarsData.length || 
                              searchBox.value.trim() !== '' ||
                              activeFilters.brands.length > 0 ||
                              activeFilters.models.length > 0 ||
                              activeFilters.fuelTypes.length > 0 ||
                              activeFilters.bodyTypes.length > 0 ||
                              activeFilters.minYear !== null ||
                              activeFilters.maxYear !== null;
            
            if (data.length === 0) {
                container.innerHTML = '<div class="no-results">No cars found matching your criteria.</div>';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }
            
            // Calculate how many cars to show
            const startIndex = displayedCars;
            const endIndex = Math.min(startIndex + carsPerPage, data.length);
            const carsToShow = data.slice(startIndex, endIndex);
            
            if (carsToShow.length === 0) {
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }
            
            carsToShow.forEach((car, index) => {
                const card = document.createElement('div');
                card.classList.add('car-card');
                card.style.cursor = 'pointer';

                const isLiked = isCarLiked(car);
                const globalIndex = startIndex + index;

                card.innerHTML = `
                    <div class="car-image-container">
                        <img src="${car.image}" alt="${car.Marks} ${car.Model}" 
                             onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop'">
                    </div>
                    <div class="car-info">
                        <h3 class="car-title">${car.Marks} ${car.Model}</h3>
                        <div class="car-details">
                            <div class="car-detail-item">
                                <i class="fa-solid fa-calendar"></i>
                                <span>${car.Year}</span>
                            </div>
                            <div class="car-detail-item">
                                <i class="fa-solid fa-gas-pump"></i>
                                <span>${car.FuelType}</span>
                            </div>
                            <div class="car-detail-item">
                                <i class="fa-solid fa-road"></i>
                                <span>${car.Milage}</span>
                            </div>
                        </div>
                        <div class="car-price">$${typeof car.Price === 'number' ? car.Price.toLocaleString() : car.Price}</div>
                        <div class="card-actions">
                            <i class="fa-solid fa-heart heart-icon ${isLiked ? 'liked' : ''}" data-index="${globalIndex}"></i>
                            <button class="buy-btn" data-buy-index="${globalIndex}">Buy Now</button>
                        </div>
                    </div>
                `;

                container.appendChild(card);
                
                // Make card clickable to navigate to detail page
                card.addEventListener('click', function(e) {
                    // Don't navigate if clicking on heart icon or buy button
                    if (!e.target.classList.contains('heart-icon') && 
                        !e.target.classList.contains('buy-btn') &&
                        !e.target.closest('.heart-icon') &&
                        !e.target.closest('.buy-btn')) {
                        // Store car data in sessionStorage and navigate
                        sessionStorage.setItem('selectedCar', JSON.stringify(car));
                        sessionStorage.setItem('selectedCarIndex', globalIndex);
                        window.location.href = 'car-details.html';
                    }
                });
            });
            
            displayedCars = endIndex;
            
            // Show/hide load more button
            if (loadMoreBtn) {
                if (displayedCars < data.length) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }

            // Heart icon click with like functionality
            document.querySelectorAll('.heart-icon').forEach(icon => {
                icon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const carIndex = parseInt(this.dataset.index);
                    const car = data[carIndex];
                    toggleLike(car, this);
                });
            });
            
            // Buy button click functionality
            document.querySelectorAll('.buy-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const carIndex = parseInt(this.dataset.buyIndex);
                    const car = data[carIndex];
                    handleBuyNow(car);
                });
            });
        }

        function showCarDetails(car) {
            const modal = document.getElementById('carModal');
            
            document.getElementById('modalTitle').textContent = `${car.Marks} ${car.Model}`;
            document.getElementById('modalName').textContent = car.Name;
            document.getElementById('modalImage').src = car.image;
            document.getElementById('modalYear').textContent = car.Year;
            document.getElementById('modalFuel').textContent = car.FuelType;
            document.getElementById('modalBan').textContent = car.BanType;
            document.getElementById('modalGear').textContent = car.GearType;
            document.getElementById('modalMilage').textContent = car.Milage;
            document.getElementById('modalCondition').textContent = car.Condition;
            document.getElementById('modalEngine').textContent = car.EngineCapacity;
            document.getElementById('modalPower').textContent = car.PowerHp;
            document.getElementById('modalTransmission').textContent = car.Transmission;
            document.getElementById('modalEquipment').textContent = car.Equipment;
            document.getElementById('modalPrice').textContent = typeof car.Price === 'number' ? `$${car.Price.toLocaleString()}` : car.Price;
            document.getElementById('modalColor').textContent = car.Color;
            
            modal.style.display = 'flex';
        }
        
        function handleBuyNow(car) {
            // Store car data and navigate to buy page
            sessionStorage.setItem('selectedCar', JSON.stringify(car));
            window.location.href = 'buy.html';
        }

        // Modal close functionality
        const carModal = document.getElementById('carModal');
        const closeModal = document.getElementById('closeModal');
        const modalBuyBtn = document.getElementById('modalBuyBtn');

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                carModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === carModal) {
                carModal.style.display = 'none';
            }
        });

        // Buy button in modal
        if (modalBuyBtn) {
            modalBuyBtn.addEventListener('click', function() {
                // Get current car data from modal
                const carName = document.getElementById('modalTitle').textContent;
                const carPrice = document.getElementById('modalPrice').textContent;
                alert(`Initiating purchase for ${carName}\nPrice: ${carPrice}\n\nThank you for your interest!`);
            });
        }

        // Add event listener for clear all button
        document.addEventListener('DOMContentLoaded', function() {
            const clearAllBtn = document.getElementById('clearAllLiked');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', clearAllLikedCars);
            }
        });

        // Horizontal Banner Advertisement functionality
        const bannerAdWrapper = document.getElementById('bannerAdWrapper');

        // Show banner ad on scroll
        window.addEventListener('scroll', function() {
            if (bannerAdWrapper) {
                const scrollPosition = window.scrollY || window.pageYOffset;
                
                // Show banner after scrolling 300px down
                if (scrollPosition > 300) {
                    bannerAdWrapper.classList.add('show');
                } else {
                    bannerAdWrapper.classList.remove('show');
                }
            }
        });

        // Load cars from JSON
        fetch('cars.json')
            .then(response => response.json())
            .then(data => {
                allCarsData = data;
                filteredCarsData = [...data];
                buildBrandModelHierarchy();
                
                // Load liked cars from sessionStorage after data is loaded
                loadLikedCars();
                
                renderCars(filteredCarsData);
                updateLikeCounter(); // Initialize counter
                
                // If filter dropdown is open, regenerate options
                if (filterDropdown && filterDropdown.style.display === 'block') {
                    generateFilterOptions();
                }
            })
            .catch(error => console.error('Error:', error));

        // Scroll Reveal Animation - Sequential reveal maintained
        let isAnimating = false;
        let hasAnimated = false;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        function revealItemsSequentially(items) {
            if (isAnimating) return;
            isAnimating = true;
            
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                    if (index === items.length - 1) {
                        isAnimating = false;
                    }
                }, index * 800); // 800ms delay between each item
            });
        }

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    const section = entry.target.closest('.scroll-reveal-section');
                    const allItems = Array.from(section.querySelectorAll('.scroll-text-item'));
                    
                    // Trigger sequential animation only once
                    hasAnimated = true;
                    revealItemsSequentially(allItems);
                    
                    // Stop observing all items after animation starts
                    allItems.forEach(item => scrollObserver.unobserve(item));
                }
            });
        }, observerOptions);

        // Initialize observer on DOM load
        document.addEventListener('DOMContentLoaded', () => {
            const scrollItems = document.querySelectorAll('.scroll-text-item');
            
            // Observe only the first item to trigger the sequence
            if (scrollItems.length > 0) {
                scrollObserver.observe(scrollItems[0]);
            }
        });