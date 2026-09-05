/** Enables React's act checks for the jsdom test environment. */
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  value: true,
  configurable: true,
});
// jsdom does not implement the native dialog lifecycle.
Object.defineProperties(HTMLDialogElement.prototype, {
  close: {
    configurable: true,
    value(this: HTMLDialogElement): void {
      this.removeAttribute("open");
    },
  },
  showModal: {
    configurable: true,
    value(this: HTMLDialogElement): void {
      this.setAttribute("open", "");
    },
  },
});
