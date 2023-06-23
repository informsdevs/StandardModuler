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

  static getAllSync(element, event) {
    let result;
    const callback = (columns) => {
      result = columns;
    };
  
    element.dispatchEvent(
      new CustomEvent(event, {
        bubbles: true,
        detail: {
          callback: callback,
        },
      })
    );
  
    return result;
  }

  static getAsync(element, event) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent(event, {
          bubbles: true,
          detail: {
            callback: (record) => {
              resolve(record);
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

  static get(element, event, data) {
    return new Promise((resolve) => {
      element.dispatchEvent(
        new CustomEvent(event, {
          bubbles: true,
          detail: {
            index: data,
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