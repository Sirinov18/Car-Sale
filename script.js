// Global variables
let allCarsData = [];
let filteredCarsData = [];
let likedCars = []; // Store liked cars
let activeFilters = {
    brands: [],
    models: [],
    selectedBrandModels: {},
    fuelTypes: [],
    bodyTypes: [],
    minYear: null,
    maxYear: null
};
let brandModelHierarchy = {};
let currentSelectedBrand = null;
let currentSelectedModel = null;

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
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
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Initialize carousel when DOM is loaded
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

    // Load liked cars from storage on page load
    loadLikedCars();
});

// Enhanced mobile menu functionality
const mobileToggle = document.getElementById('mobileToggle');
const mobileDropdown = document.getElementById('mobileDropdown');

// Function to close mobile menu (global scope)
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
    // Toggle mobile menu
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileDropdown.classList.toggle('show');
        const icon = mobileToggle.querySelector('i');
        
        if (mobileDropdown.classList.contains('show')) {
            icon.classList.replace('fa-bars', 'fa-times');
            // Add active state to toggle button
            mobileToggle.classList.add('active');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
            mobileToggle.classList.remove('active');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !mobileDropdown.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close mobile menu when clicking on menu items
    mobileDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMobileMenu();
        }
    });

    // Close mobile menu on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

// Search functionality
const searchBox = document.getElementById('search-box');
const searchIcon = document.getElementById('searchIcon');
const filterIcon = document.getElementById('filterIcon');
const searchDropdown = document.getElementById('searchDropdown');
const filterDropdown = document.getElementById('filterDropdown');

function buildBrandModelHierarchy() {
    brandModelHierarchy = {};
    
    allCarsData.forEach(car => {
        // Build brand -> model hierarchy
        if (!brandModelHierarchy[car.Marks]) {
            brandModelHierarchy[car.Marks] = new Set();
        }
        brandModelHierarchy[car.Marks].add(car.Model);
    });
    
    // Convert Sets to sorted Arrays (automatically removes duplicates)
    Object.keys(brandModelHierarchy).forEach(brand => {
        brandModelHierarchy[brand] = Array.from(brandModelHierarchy[brand]).sort();
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

searchIcon.addEventListener('click', function() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm) {
        performSearch(searchTerm);
        hideSearchDropdown();
    }
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
});

function hideSearchDropdown() {
    searchDropdown.style.display = 'none';
}

function showFilterDropdown() {
    generateFilterOptions();
    filterDropdown.style.display = 'block';
}

function hideFilterDropdown() {
    filterDropdown.style.display = 'none';
}

function generateFilterOptions() {
    generateBrandModelHierarchy();
    
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
    
    document.getElementById('minYear').value = activeFilters.minYear || '';
    document.getElementById('maxYear').value = activeFilters.maxYear || '';
    
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            const type = this.dataset.type;
            const value = this.dataset.value;
            
            this.classList.toggle('active');
            
            if (type === 'fuel') {
                toggleFilterValue(activeFilters.fuelTypes, value);
            } else if (type === 'body') {
                toggleFilterValue(activeFilters.bodyTypes, value);
            }
        });
    });
}

function generateBrandModelHierarchy() {
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
                currentSelectedBrand = null;
                currentSelectedModel = null;
                hideModelOptions();
            } else {
                // Selecting new brand
                activeFilters.brands = [brand];
                activeFilters.models = [];
                activeFilters.selectedBrandModels = {};
                currentSelectedBrand = brand;
                currentSelectedModel = null;
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
            } else {
                // Add model to selection
                activeFilters.selectedBrandModels[brand].push(model);
            }
            
            // Update global models array
            activeFilters.models = [];
            Object.values(activeFilters.selectedBrandModels).forEach(models => {
                activeFilters.models.push(...models);
            });
        });
    });
}


function hideModelOptions() {
    const modelSection = document.getElementById('modelSection');
    if (modelSection && activeFilters.brands.length === 0) {
        modelSection.style.display = 'none';
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
    
    activeFilters.minYear = minYear ? parseInt(minYear) : null;
    activeFilters.maxYear = maxYear ? parseInt(maxYear) : null;
    
    applyFilters();
    hideFilterDropdown();
});

document.getElementById('clearFilters').addEventListener('click', function() {
    activeFilters = {
        brands: [],
        models: [],
        selectedBrandModels: {},
        fuelTypes: [],
        bodyTypes: [],
        minYear: null,
        maxYear: null
    };
    
    currentSelectedBrand = null;
    currentSelectedModel = null;
    searchBox.value = '';
    
    filteredCarsData = [...allCarsData];
    renderCars(filteredCarsData);
    
    hideModelOptions();
    generateFilterOptions();
});

function applyFilters() {
    let filtered = [...allCarsData];
    
    // Apply model filter
    if (activeFilters.models.length > 0) {
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
    
    if (activeFilters.fuelTypes.length > 0) {
        filtered = filtered.filter(car => activeFilters.fuelTypes.includes(car.FuelType));
    }
    
    if (activeFilters.bodyTypes.length > 0) {
        filtered = filtered.filter(car => activeFilters.bodyTypes.includes(car.BanType));
    }
    
    if (activeFilters.minYear) {
        filtered = filtered.filter(car => parseInt(car.Year) >= activeFilters.minYear);
    }
    if (activeFilters.maxYear) {
        filtered = filtered.filter(car => parseInt(car.Year) <= activeFilters.maxYear);
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
    const likedData = likedCars.map(car => ({
        Marks: car.Marks,
        Model: car.Model,
        Year: car.Year
    }));
    // Store in memory (no localStorage as per requirements)
    window.likedCarsData = likedData;
}

function loadLikedCars() {
    // Load from memory if exists
    if (window.likedCarsData) {
        // This will be populated after cars are loaded
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
    if (likedCars.length > 1) {
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
            card.classList.add('car-card'); // Use same class as main cards
            
            card.innerHTML = `
                <img src="${car.image}" alt="${car.Marks} ${car.Model}" 
                     onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop'">
                <button class="delete-btn" data-delete-index="${index}" title="Remove from favorites">
                    <i class="fa-solid fa-times"></i>
                </button>
                <h3>${car.Marks} ${car.Model}</h3>
                <p class="car-price">$${typeof car.Price === 'number' ? car.Price.toLocaleString() : car.Price}</p>
                <div class="card-actions">
                    <i class="fa-solid fa-heart heart-icon liked" data-liked-index="${index}"></i>
                    <button class="details-btn" data-liked-car="${index}">Details</button>
                </div>
            `;
            
            likedCarsList.appendChild(card);
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
            icon.addEventListener('click', function() {
                const index = parseInt(this.dataset.likedIndex);
                removeLikedCarDirectly(index);
            });
        });
        
        // Add event listeners for details buttons (show inline details)
        document.querySelectorAll('[data-liked-car]').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.likedCar);
                const car = likedCars[index];
                showInlineCarDetails(car, index);
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

function renderCars(data) {
    const container = document.getElementById('carList');
    
    const isFiltered = data.length !== allCarsData.length || 
                      searchBox.value.trim() !== '' ||
                      activeFilters.brands.length > 0 ||
                      activeFilters.models.length > 0 ||
                      activeFilters.fuelTypes.length > 0 ||
                      activeFilters.bodyTypes.length > 0 ||
                      activeFilters.minYear !== null ||
                      activeFilters.maxYear !== null;
    
    if (isFiltered) {
        container.style.justifyContent = 'flex-start';
    } else {
        container.style.justifyContent = 'space-between';
    }
    
    if (data.length === 0) {
        container.innerHTML = '<div class="no-results">No cars found matching your criteria.</div>';
        return;
    }
    
    container.innerHTML = '';

    data.forEach((car, index) => {
        const card = document.createElement('div');
        card.classList.add('car-card');

        const isLiked = isCarLiked(car);

        card.innerHTML = `
            <img src="${car.image}" alt="${car.Marks} ${car.Model}" 
                 onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop'">
            <h3>${car.Marks} ${car.Model}</h3>
            <div class="card-actions">
                <i class="fa-solid fa-heart heart-icon ${isLiked ? 'liked' : ''}" data-index="${index}"></i>
                <button class="details-btn" data-index="${index}">Details</button>
            </div>
        `;

        container.appendChild(card);
    });

    // Heart icon click with like functionality
    document.querySelectorAll('.heart-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const carIndex = parseInt(this.dataset.index);
            const car = data[carIndex];
            toggleLike(car, this);
        });
    });

    const modal = document.getElementById('carModal');
    const closeModal = document.getElementById('closeModal');

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const car = data[btn.dataset.index];
            showCarDetails(car);
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
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

// Add event listener for clear all button
document.addEventListener('DOMContentLoaded', function() {
    const clearAllBtn = document.getElementById('clearAllLiked');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllLikedCars);
    }
});

// Load cars from JSON
fetch('cars.json')
    .then(response => response.json())
    .then(data => {
        allCarsData = data;
        filteredCarsData = [...data];
        buildBrandModelHierarchy();
        renderCars(filteredCarsData);
        updateLikeCounter(); // Initialize counter
    })
    .catch(error => console.error('Error:', error));
