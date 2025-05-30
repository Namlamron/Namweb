class OverlayEditor {
    constructor() {
        this.canvas = document.getElementById('overlayCanvas');
        this.selectedElement = null;
        this.elements = [];
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeDirection = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Add element buttons
        document.getElementById('addText').addEventListener('click', () => this.addElement('text'));
        document.getElementById('addImage').addEventListener('click', () => this.addElement('image'));
        document.getElementById('addLink').addEventListener('click', () => this.addElement('link'));

        // Save and export buttons
        document.getElementById('saveOverlay').addEventListener('click', () => this.saveOverlay());
        document.getElementById('exportOverlay').addEventListener('click', () => this.exportOverlay());

        // Canvas click to deselect
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                this.deselectElement();
            }
        });
    }

    addElement(type) {
        const element = document.createElement('div');
        element.className = 'overlay-element';
        element.dataset.type = type;

        // Add resize handles
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            element.appendChild(handle);
        });

        // Set initial position and size
        element.style.left = '100px';
        element.style.top = '100px';
        element.style.width = '200px';
        element.style.height = '100px';

        // Add content based on type
        switch (type) {
            case 'text':
                element.innerHTML += '<div contenteditable="true">Double click to edit text</div>';
                break;
            case 'image':
                const img = document.createElement('img');
                img.src = 'https://via.placeholder.com/200x100';
                element.appendChild(img);
                break;
            case 'link':
                element.innerHTML += '<a href="#" contenteditable="true">https://example.com</a>';
                break;
        }

        // Add event listeners
        this.addElementEventListeners(element);

        // Add to canvas
        this.canvas.appendChild(element);
        this.elements.push(element);
        this.selectElement(element);
    }

    addElementEventListeners(element) {
        // Selection
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // Dragging
        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) {
                this.startResize(element, e);
            } else {
                this.startDrag(element, e);
            }
        });

        // Double click to edit text
        element.addEventListener('dblclick', (e) => {
            if (element.dataset.type === 'text' || element.dataset.type === 'link') {
                e.target.contentEditable = true;
                e.target.focus();
            }
        });
    }

    selectElement(element) {
        this.deselectElement();
        element.classList.add('selected');
        this.selectedElement = element;
        this.updatePropertiesPanel();
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
            this.updatePropertiesPanel();
        }
    }

    startDrag(element, e) {
        this.isDragging = true;
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.handleDrag);
        });
    }

    handleDrag = (e) => {
        if (!this.isDragging || !this.selectedElement) return;

        const x = e.clientX - this.canvas.getBoundingClientRect().left - this.dragOffset.x;
        const y = e.clientY - this.canvas.getBoundingClientRect().top - this.dragOffset.y;

        this.selectedElement.style.left = `${x}px`;
        this.selectedElement.style.top = `${y}px`;
    }

    startResize(element, e) {
        this.isResizing = true;
        this.resizeDirection = e.target.classList[1];
        const rect = element.getBoundingClientRect();
        this.resizeStart = {
            x: e.clientX,
            y: e.clientY,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };

        document.addEventListener('mousemove', this.handleResize);
        document.addEventListener('mouseup', () => {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.handleResize);
        });
    }

    handleResize = (e) => {
        if (!this.isResizing || !this.selectedElement) return;

        const deltaX = e.clientX - this.resizeStart.x;
        const deltaY = e.clientY - this.resizeStart.y;

        switch (this.resizeDirection) {
            case 'se':
                this.selectedElement.style.width = `${this.resizeStart.width + deltaX}px`;
                this.selectedElement.style.height = `${this.resizeStart.height + deltaY}px`;
                break;
            case 'sw':
                this.selectedElement.style.width = `${this.resizeStart.width - deltaX}px`;
                this.selectedElement.style.height = `${this.resizeStart.height + deltaY}px`;
                this.selectedElement.style.left = `${this.resizeStart.left + deltaX}px`;
                break;
            case 'ne':
                this.selectedElement.style.width = `${this.resizeStart.width + deltaX}px`;
                this.selectedElement.style.height = `${this.resizeStart.height - deltaY}px`;
                this.selectedElement.style.top = `${this.resizeStart.top + deltaY}px`;
                break;
            case 'nw':
                this.selectedElement.style.width = `${this.resizeStart.width - deltaX}px`;
                this.selectedElement.style.height = `${this.resizeStart.height - deltaY}px`;
                this.selectedElement.style.left = `${this.resizeStart.left + deltaX}px`;
                this.selectedElement.style.top = `${this.resizeStart.top + deltaY}px`;
                break;
        }
    }

    updatePropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        panel.innerHTML = '';

        if (!this.selectedElement) {
            panel.innerHTML = '<p class="no-selection">Select an element to edit its properties</p>';
            return;
        }

        // Position properties
        this.addPropertyInput(panel, 'X Position', 'left', 'px');
        this.addPropertyInput(panel, 'Y Position', 'top', 'px');
        this.addPropertyInput(panel, 'Width', 'width', 'px');
        this.addPropertyInput(panel, 'Height', 'height', 'px');

        // Type-specific properties
        if (this.selectedElement.dataset.type === 'text') {
            this.addPropertyInput(panel, 'Font Size', 'fontSize', 'px');
            this.addPropertyInput(panel, 'Color', 'color', '');
        }
    }

    addPropertyInput(panel, label, property, unit) {
        const group = document.createElement('div');
        group.className = 'property-group';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.selectedElement.style[property] || '';
        input.addEventListener('change', (e) => {
            this.selectedElement.style[property] = e.target.value + unit;
        });

        group.appendChild(labelElement);
        group.appendChild(input);
        panel.appendChild(group);
    }

    saveOverlay() {
        const overlayData = this.elements.map(element => ({
            type: element.dataset.type,
            position: {
                left: element.style.left,
                top: element.style.top
            },
            size: {
                width: element.style.width,
                height: element.style.height
            },
            content: element.innerHTML
        }));

        localStorage.setItem('overlayData', JSON.stringify(overlayData));
        alert('Overlay saved successfully!');
    }

    exportOverlay() {
        if (!this.selectedElement) {
            alert('Please select an element to export');
            return;
        }

        const elementData = {
            type: this.selectedElement.dataset.type,
            position: {
                left: this.selectedElement.style.left,
                top: this.selectedElement.style.top
            },
            size: {
                width: this.selectedElement.style.width,
                height: this.selectedElement.style.height
            },
            content: this.selectedElement.innerHTML
        };

        const blob = new Blob([JSON.stringify(elementData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obs-overlay-element.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OverlayEditor();
}); 