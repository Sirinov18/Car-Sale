// Global variables
let allCarsData = [];
let filteredCarsData = [];
let activeFilters = {
    brands: [],
    models: [], // New: selected models
    selectedBrandModels: {}, // New: track which models are selected for each brand
    fuelTypes: [],
    bodyTypes: [],
    minYear: null,
    maxYear: null
};
let brandModelHierarchy = {}; // New: store brand-model relationships

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
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

// Auto-play carousel
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Carousel navigation
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
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoPlay();
            currentSlide = index;
            showSlide(currentSlide);
            startAutoPlay();
        });
    });
    
    // Start auto-play
    startAutoPlay();
    
    // Pause auto-play on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
});

// Toggle dropdown menu
const mobileToggle = document.getElementById('mobileToggle');
const mobileDropdown = document.getElementById('mobileDropdown');

if (mobileToggle && mobileDropdown) {
    mobileToggle.addEventListener('click', () => {
        mobileDropdown.classList.toggle('show');
        const icon = mobileToggle.querySelector('i');
        if (mobileDropdown.classList.contains('show')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
}

// Search functionality
const searchBox = document.getElementById('search-box');
const searchIcon = document.getElementById('searchIcon');
const filterIcon = document.getElementById('filterIcon');
const searchDropdown = document.getElementById('searchDropdown');
const filterDropdown = document.getElementById('filterDropdown');

// Build brand-model hierarchy from data
function buildBrandModelHierarchy() {
    brandModelHierarchy = {};
    allCarsData.forEach(car => {
        if (!brandModelHierarchy[car.Marks]) {
            brandModelHierarchy[car.Marks] = new Set();
        }
        brandModelHierarchy[car.Marks].add(car.Model);
    });
    
    // Convert Sets to Arrays for easier handling
    Object.keys(brandModelHierarchy).forEach(brand => {
        brandModelHierarchy[brand] = Array.from(brandModelHierarchy[brand]).sort();
    });
}

// Enhanced search to include models
function showSearchResults(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase();
    
    // Search in cars
    allCarsData.forEach(car => {
        let relevance = 0;
        let matchType = '';
        
        if (car.Marks.toLowerCase().includes(term)) {
            relevance += car.Marks.toLowerCase() === term ? 100 : 50;
            matchType = 'brand';
        }
        if (car.Model.toLowerCase().includes(term)) {
            relevance += car.Model.toLowerCase() === term ? 100 : 50;
            matchType = 'model';
        }
        if (car.Name.toLowerCase().includes(term)) relevance += 40;
        if (car.BanType.toLowerCase().includes(term)) relevance += 30;
        if (car.FuelType.toLowerCase().includes(term)) relevance += 30;
        if (car.Color.toLowerCase().includes(term)) relevance += 20;
        if (car.Year.toString().includes(term)) relevance += 25;
        
        if (relevance > 0) {
            results.push({
                car: car,
                relevance: relevance,
                matchType: matchType
            });
        }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    if (results.length > 0) {
        // Group by brand-model combination to avoid duplicates
        const uniqueResults = [];
        const seen = new Set();
        
        results.forEach(result => {
            const key = `${result.car.Marks}-${result.car.Model}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(result);
            }
        });
        
        const html = uniqueResults.slice(0, 6).map(result => 
            `<div class="search-result" onclick="selectSearchResult('${result.car.Marks}', '${result.car.Model}')">
                ${result.car.Marks} ${result.car.Model} (${result.car.Year}) - $${result.car.Price.toLocaleString()}
            </div>`
        ).join('');
        
        searchDropdown.innerHTML = html;
    } else {
        searchDropdown.innerHTML = '<div class="no-search-results">No results found</div>';
    }
    
    searchDropdown.style.display = 'block';
}

function selectSearchResult(brand, model) {
    searchBox.value = `${brand} ${model}`;
    performSearch(`${brand} ${model}`.toLowerCase());
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

// Search icon click event
searchIcon.addEventListener('click', function() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm) {
        performSearch(searchTerm);
        hideSearchDropdown();
    }
});

// Search box input event (live search)
searchBox.addEventListener('input', function() {
    const searchTerm = this.value.trim().toLowerCase();
    if (searchTerm.length >= 2) {
        showSearchResults(searchTerm);
    } else if (searchTerm.length === 0) {
        hideSearchDropdown();
        renderCars(filteredCarsData);
    }
});

// Search box enter key event
searchBox.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value.trim().toLowerCase();
        if (searchTerm) {
            performSearch(searchTerm);
            hideSearchDropdown();
        }
    }
});

// Filter icon click event
filterIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    if (filterDropdown.style.display === 'block') {
        hideFilterDropdown();
    } else {
        hideSearchDropdown();
        showFilterDropdown();
    }
});

// Hide dropdowns when clicking outside
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

// Enhanced filter functions
function showFilterDropdown() {
    generateFilterOptions();
    filterDropdown.style.display = 'block';
}

function hideFilterDropdown() {
    filterDropdown.style.display = 'none';
}

// NEW: Generate hierarchical brand-model filter options
function generateFilterOptions() {
    // Generate hierarchical brand-model options
    generateBrandModelHierarchy();
    
    // Generate fuel type options
    const fuelTypes = [...new Set(allCarsData.map(car => car.FuelType))].sort();
    const fuelContainer = document.getElementById('fuelOptions');
    fuelContainer.innerHTML = fuelTypes.map(fuel => 
        `<span class="filter-option ${activeFilters.fuelTypes.includes(fuel) ? 'active' : ''}" 
               data-type="fuel" data-value="${fuel}">${fuel}</span>`
    ).join('');
    
    // Generate body type options
    const bodyTypes = [...new Set(allCarsData.map(car => car.BanType))].sort();
    const bodyContainer = document.getElementById('bodyOptions');
    bodyContainer.innerHTML = bodyTypes.map(body => 
        `<span class="filter-option ${activeFilters.bodyTypes.includes(body) ? 'active' : ''}" 
               data-type="body" data-value="${body}">${body}</span>`
    ).join('');
    
    // Set year values
    document.getElementById('minYear').value = activeFilters.minYear || '';
    document.getElementById('maxYear').value = activeFilters.maxYear || '';
    
    // Add click events to filter options
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

// NEW: Generate brand options and show models when brand is selected
function generateBrandModelHierarchy() {
    const brandContainer = document.getElementById('brandOptions');
    if (!brandContainer) {
        return;
    }
    
    const brands = Object.keys(brandModelHierarchy).sort();
    
    // Generate brand options
    let html = '';
    brands.forEach(brand => {
        const isSelected = activeFilters.brands.includes(brand);
        html += `<span class="filter-option brand-option ${isSelected ? 'active' : ''}" 
                       data-type="brand" data-value="${brand}">${brand}</span>`;
    });
    
    brandContainer.innerHTML = html;
    
    // Add click events for brands
    document.querySelectorAll('.brand-option').forEach(option => {
        option.addEventListener('click', function() {
            const brand = this.dataset.value;
            this.classList.toggle('active');
            
            // Toggle brand in activeFilters
            const brandIndex = activeFilters.brands.indexOf(brand);
            if (brandIndex > -1) {
                activeFilters.brands.splice(brandIndex, 1);
                // Clear models for this brand
                if (activeFilters.selectedBrandModels[brand]) {
                    activeFilters.selectedBrandModels[brand].forEach(model => {
                        const modelIndex = activeFilters.models.indexOf(model);
                        if (modelIndex > -1) {
                            activeFilters.models.splice(modelIndex, 1);
                        }
                    });
                    delete activeFilters.selectedBrandModels[brand];
                }
                hideModelOptions();
            } else {
                activeFilters.brands.push(brand);
                showModelOptions(brand);
            }
        });
    });
}

// Show model options for selected brand
function showModelOptions(brand) {
    const models = brandModelHierarchy[brand];
    if (!models || models.length === 0) return;
    
    // Find or create model section
    let modelSection = document.getElementById('modelSection');
    if (!modelSection) {
        const filterDropdown = document.getElementById('filterDropdown');
        const brandSection = filterDropdown.querySelector('.filter-section');
        
        modelSection = document.createElement('div');
        modelSection.className = 'filter-section';
        modelSection.id = 'modelSection';
        modelSection.innerHTML = '<h4>Models</h4><div class="filter-options" id="modelOptions"></div>';
        
        // Insert after brand section
        brandSection.parentNode.insertBefore(modelSection, brandSection.nextSibling);
    }
    
    const modelContainer = document.getElementById('modelOptions');
    const selectedModelsForBrand = activeFilters.selectedBrandModels[brand] || [];
    
    let html = '';
    models.forEach(model => {
        const isSelected = selectedModelsForBrand.includes(model);
        html += `<span class="filter-option model-option ${isSelected ? 'active' : ''}" 
                       data-brand="${brand}" data-model="${model}">${model}</span>`;
    });
    
    modelContainer.innerHTML = html;
    modelSection.style.display = 'block';
    
    // Add click events for models
    document.querySelectorAll('.model-option').forEach(option => {
        option.addEventListener('click', function() {
            const brand = this.dataset.brand;
            const model = this.dataset.model;
            
            this.classList.toggle('selected');
            
            if (!activeFilters.selectedBrandModels[brand]) {
                activeFilters.selectedBrandModels[brand] = [];
            }
            
            const modelIndex = activeFilters.selectedBrandModels[brand].indexOf(model);
            if (modelIndex > -1) {
                activeFilters.selectedBrandModels[brand].splice(modelIndex, 1);
                // Remove from global models array
                const globalModelIndex = activeFilters.models.indexOf(model);
                if (globalModelIndex > -1) {
                    activeFilters.models.splice(globalModelIndex, 1);
                }
            } else {
                activeFilters.selectedBrandModels[brand].push(model);
                // Add to global models array
                if (!activeFilters.models.includes(model)) {
                    activeFilters.models.push(model);
                }
            }
        });
    });
}

// Hide model options when no brands are selected
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

// Filter button events
document.getElementById('applyFilters').addEventListener('click', function() {
    // Get year range values
    const minYear = document.getElementById('minYear').value;
    const maxYear = document.getElementById('maxYear').value;
    
    activeFilters.minYear = minYear ? parseInt(minYear) : null;
    activeFilters.maxYear = maxYear ? parseInt(maxYear) : null;
    
    // Apply filters
    applyFilters();
    hideFilterDropdown();
});

document.getElementById('clearFilters').addEventListener('click', function() {
    // Clear all filters
    activeFilters = {
        brands: [],
        models: [],
        selectedBrandModels: {},
        fuelTypes: [],
        bodyTypes: [],
        minYear: null,
        maxYear: null
    };
    
    // Clear search box
    searchBox.value = '';
    
    // Reset filtered data and render
    filteredCarsData = [...allCarsData];
    renderCars(filteredCarsData);
    
    // Regenerate filter options
    generateFilterOptions();
});

// Enhanced apply filters function
function applyFilters() {
    let filtered = [...allCarsData];
    
    // Apply brand and model filter (hierarchical)
    if (activeFilters.models.length > 0) {
        filtered = filtered.filter(car => {
            // Check if the car's brand has selected models
            const selectedModelsForBrand = activeFilters.selectedBrandModels[car.Marks];
            if (selectedModelsForBrand && selectedModelsForBrand.length > 0) {
                return selectedModelsForBrand.includes(car.Model);
            }
            return false;
        });
    } else if (activeFilters.brands.length > 0) {
        // If no specific models selected, show all cars of selected brands
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
    
    // Apply year range filter
    if (activeFilters.minYear) {
        filtered = filtered.filter(car => parseInt(car.Year) >= activeFilters.minYear);
    }
    if (activeFilters.maxYear) {
        filtered = filtered.filter(car => parseInt(car.Year) <= activeFilters.maxYear);
    }
    
    filteredCarsData = filtered;
    renderCars(filteredCarsData);
}

// Enhanced render cars function
function renderCars(data) {
    const container = document.getElementById('carList');
    
    // Check if this is filtered/searched data or original data
    const isFiltered = data.length !== allCarsData.length || 
                      searchBox.value.trim() !== '' ||
                      activeFilters.brands.length > 0 ||
                      activeFilters.models.length > 0 ||
                      activeFilters.fuelTypes.length > 0 ||
                      activeFilters.bodyTypes.length > 0 ||
                      activeFilters.minYear !== null ||
                      activeFilters.maxYear !== null;
    
    // Update container layout based on filter status
    if (isFiltered) {
        container.style.justifyContent = 'flex-start'; // Left-aligned for filtered results
    } else {
        container.style.justifyContent = 'space-between'; // Original layout for all data
    }
    
    if (data.length === 0) {
        container.innerHTML = '<div class="no-results">No cars found matching your criteria.</div>';
        return;
    }
    
    container.innerHTML = '';

    data.forEach((car, index) => {
        const card = document.createElement('div');
        card.classList.add('car-card');

        card.innerHTML = `
            <img src="${car.image}" alt="${car.Marks} ${car.Model}" 
                 onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=250&fit=crop'">
            <h3>${car.Marks} ${car.Model}</h3>
            <div class="card-actions">
                <i class="fa-solid fa-heart heart-icon" data-index="${index}"></i>
                <button class="details-btn" data-index="${index}">Details</button>
            </div>
        `;

        container.appendChild(card);
    });

    // Heart icon click
    document.querySelectorAll('.heart-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            icon.classList.toggle('liked');
        });
    });

    // Modal elements
    const modal = document.getElementById('carModal');
    const closeModal = document.getElementById('closeModal');

    // Details button click
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const car = data[btn.dataset.index];
            showCarDetails(car);
        });
    });

    // Modal close
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// Show car details in modal
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

// Load cars from JSON
fetch('cars.json')
    .then(response => response.json())
    .then(data => {
        allCarsData = data;
        filteredCarsData = [...data];
        buildBrandModelHierarchy(); // Build hierarchy after data loads
        renderCars(filteredCarsData);
    })
    .catch(error => console.error('Error:', error));