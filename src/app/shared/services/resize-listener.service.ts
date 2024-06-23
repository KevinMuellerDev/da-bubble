import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class ResizeListenerService {
  /** Resize callbacks to call on resize event */
  private resizeCallbacks: (() => void)[] = [];
  /** Screen sizes width in px */
  /** <= 1440px - 960px */
  xmdScreen: boolean = false;
  /** <= 960px - 600px */
  mdScreen: boolean = false;
  /** <= 600px - 480px */
  xsmScreen: boolean = false;
  /** <= 480px */
  smScreen: boolean = false;

  /**
   * Constructor for the service that listens for resize events
   * @param ngZone - NgZone
   */
  constructor(private ngZone: NgZone) {
    window.addEventListener('resize', this.onResize.bind(this));
    this.updateScreenSize();
  }

  /**
   * Called on resize event to update the screen sizes and call the registered callbacks
   */
  private onResize() {
    this.ngZone.run(() => {
      this.updateScreenSize();
      this.resizeCallbacks.forEach(callback => callback());
    });
  }

  /**
   * Updates the screen sizes
   */
  private updateScreenSize() {
    const width = window.innerWidth;
    this.xmdScreen = width <= 1440 && width > 960;  // medium screen
    this.mdScreen = width <= 960 && width > 600;    // smaller medium screen
    this.xsmScreen = width <= 600 && width > 480;   // larger small screen
    this.smScreen = width <= 480;                   // small screen
  }

  /**
   * A function to register a callback for resize events.
   * @param {() => void} callback - The callback function to be registered.
   */
  registerResizeCallback(callback: () => void) {
    this.resizeCallbacks.push(callback);
    callback();
  }

  /**
   * A function to unregister a callback for resize events.
   * @param {() => void} callback - The callback function to be unregistered.
   */
  unregisterResizeCallback(callback: () => void) {
    this.resizeCallbacks = this.resizeCallbacks.filter(cb => cb !== callback);
  }
}
