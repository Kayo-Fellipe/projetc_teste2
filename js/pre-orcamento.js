// Pré-Orçamento Calculator

class OrcamentoCalculator {
  constructor() {
    this.form = document.getElementById('orcamento-form');
    this.resultContainer = document.getElementById('calculation-result');
    
    // Pricing configuration
    this.pricing = {
      hourlyRates: {
        photography: 50,
        videography: 50,
        both: 70
      },
      editingRates: {
        base: 50,
        withAfterEffects: 70
      },
      softwareCosts: {
        lightroom: 15,
        photoshop: 30,
        premiere: 20,
        afterEffects: 50
      },
      transport: {
        fuelPrice: 5.5,
        consumption: 8 // km per liter
      }
    };

    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.bindEvents();
    this.updateRangeDisplays();
  }

  bindEvents() {
    // Form input changes
    this.form.addEventListener('input', () => this.calculateTotal());
    this.form.addEventListener('change', () => this.calculateTotal());

    // Range inputs
    const ranges = this.form.querySelectorAll('input[type="range"]');
    ranges.forEach(range => {
      range.addEventListener('input', (e) => {
        this.updateRangeDisplay(e.target);
        this.calculateTotal();
      });
    });

    // Checkbox styling
    const checkboxItems = this.form.querySelectorAll('.checkbox-item');
    checkboxItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      
      item.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          this.updateCheckboxStyle(item, checkbox.checked);
          this.calculateTotal();
        }
      });

      checkbox.addEventListener('change', (e) => {
        this.updateCheckboxStyle(item, e.target.checked);
      });
    });

    // Contact button
    const contactBtn = document.getElementById('contact-orcamento-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        // Scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  updateRangeDisplay(rangeInput) {
    const displayId = rangeInput.id + '-display';
    const display = document.getElementById(displayId);
    
    if (display) {
      let value = rangeInput.value;
      let unit = '';

      if (rangeInput.id === 'event-duration') {
        unit = value === '1' ? ' hora' : ' horas';
      } else if (rangeInput.id === 'editing-time') {
        unit = value === '1' ? ' hora' : ' horas';
      } else if (rangeInput.id === 'distance') {
        unit = ' km';
      }

      display.textContent = value + unit;
    }
  }

  updateRangeDisplays() {
    const ranges = this.form.querySelectorAll('input[type="range"]');
    ranges.forEach(range => this.updateRangeDisplay(range));
  }

  updateCheckboxStyle(item, checked) {
    if (checked) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    // Get basic form values
    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    // Get checkbox values
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]:checked');
    const services = [];
    const software = [];

    checkboxes.forEach(checkbox => {
      if (checkbox.name === 'services') {
        services.push(checkbox.value);
      } else if (checkbox.name === 'software') {
        software.push(checkbox.value);
      }
    });

    data.services = services;
    data.software = software;

    return data;
  }

  calculateTotal() {
    const data = this.getFormData();
    
    // Validate required fields
    if (!data.services || data.services.length === 0) {
      this.hideResult();
      return;
    }

    const calculation = {
      eventCost: 0,
      editingCost: 0,
      softwareCost: 0,
      transportCost: 0,
      tollCost: 0,
      total: 0
    };

    // Calculate event cost (hourly rate)
    const eventDuration = parseInt(data['event-duration']) || 0;
    const hasPhotography = data.services.includes('photography');
    const hasVideography = data.services.includes('videography');
    
    let hourlyRate = 0;
    if (hasPhotography && hasVideography) {
      hourlyRate = this.pricing.hourlyRates.both;
    } else if (hasPhotography || hasVideography) {
      hourlyRate = this.pricing.hourlyRates.photography;
    }

    calculation.eventCost = eventDuration * hourlyRate;

    // Calculate editing cost
    const editingTime = parseInt(data['editing-time']) || 0;
    const hasAfterEffects = data.software && data.software.includes('afterEffects');
    
    const editingRate = hasAfterEffects ? 
      this.pricing.editingRates.withAfterEffects : 
      this.pricing.editingRates.base;

    calculation.editingCost = editingTime * editingRate;

    // Calculate software costs
    if (data.software) {
      data.software.forEach(software => {
        calculation.softwareCost += this.pricing.softwareCosts[software] || 0;
      });
    }

    // Calculate transport cost
    const distance = parseInt(data.distance) || 0;
    if (distance > 0) {
      const fuelNeeded = distance / this.pricing.transport.consumption;
      calculation.transportCost = fuelNeeded * this.pricing.transport.fuelPrice;
    }

    // Add toll cost
    const tollCost = parseFloat(data.toll) || 0;
    calculation.tollCost = tollCost;

    // Calculate total
    calculation.total = calculation.eventCost + 
                      calculation.editingCost + 
                      calculation.softwareCost + 
                      calculation.transportCost + 
                      calculation.tollCost;

    this.displayResult(calculation);
  }

  displayResult(calculation) {
    if (!this.resultContainer) return;

    // Update breakdown values
    this.updateBreakdownValue('event-cost', calculation.eventCost);
    this.updateBreakdownValue('editing-cost', calculation.editingCost);
    this.updateBreakdownValue('software-cost', calculation.softwareCost);
    this.updateBreakdownValue('transport-cost', calculation.transportCost);
    this.updateBreakdownValue('toll-cost', calculation.tollCost);

    // Update total
    const totalElement = document.getElementById('total-value');
    if (totalElement) {
      totalElement.textContent = this.formatCurrency(calculation.total);
    }

    // Show result with animation
    this.showResult();
  }

  updateBreakdownValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = this.formatCurrency(value);
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  showResult() {
    if (this.resultContainer) {
      this.resultContainer.classList.add('show');
      
      // Scroll to result
      setTimeout(() => {
        this.resultContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 300);
    }
  }

  hideResult() {
    if (this.resultContainer) {
      this.resultContainer.classList.remove('show');
    }
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OrcamentoCalculator();
});