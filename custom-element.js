

class Component extends HTMLElement {
    connectedCallback(){
        this.html = this.html();
        

    }
}



class ParentElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <child-element1 prop1="Value 1"></child-element1>
        <child-element2 prop2="Value 2"></child-element2>
      `;
  
      const childElement1 = this.querySelector('child-element1');
      const childElement2 = this.querySelector('child-element2');
  
      this.addEventListener('customEvent', this.handleCustomEvent.bind(this));
      
    }
  
    handleCustomEvent(event) {
      console.log('Received custom event:', event.detail);
    }
  }
  
  customElements.define('parent-element', ParentElement);
  
  class ChildElement1 extends HTMLElement {
    connectedCallback() {
      const prop1 = this.getAttribute('prop1') || '';
      this.innerHTML = `<p>Child Element 1 - Prop 1: ${prop1}</p>`;
  
      const customEvent = new CustomEvent('customEvent', {
        bubbles: true,
        detail: 'Custom Event from Child Element 1',
      });
      this.dispatchEvent(customEvent);
    }
  }
  
  customElements.define('child-element1', ChildElement1);
  
  class ChildElement2 extends HTMLElement {
    connectedCallback() {
      const prop2 = this.getAttribute('prop2') || '';
      this.innerHTML = `<p>Child Element 2 - Prop 2: ${prop2}</p>`;
  
      const customEvent = new CustomEvent('customEvent', {
        bubbles: true,
        detail: 'Custom Event from Child Element 2',
      });
      this.dispatchEvent(customEvent);
    }
  }
  
  customElements.define('child-element2', ChildElement2);
  