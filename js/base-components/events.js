export class Events {
  
  static getAllAsync(element, event) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent(event, {
          bubbles: true,
          detail: {
            callback: (records) => {
              resolve(records);
            },
          },
        })
      );
    });
  }

  static validateAllAsync(element, data) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent("validaterecords", {
          bubbles: true,
          detail: {
            records: data,
            callback: (records) => {
              resolve(records);
            },
          },
        })
      );
    });
  }

  static sendAll(element, data) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent('sendall', {
          bubbles: true,
          detail: data
        })
      );
    });

  }

  static send(element, event, data) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent(event, {
          bubbles: true,
          detail: data
        })
      );
    });

  }

  static invoke(element, event) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent(event, {
          bubbles: true
        })
      );
    });

  }

}