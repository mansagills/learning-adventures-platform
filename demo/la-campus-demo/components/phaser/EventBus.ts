/**
 * EventBus - Singleton event emitter for React ↔ Phaser communication
 *
 * This EventBus allows React components and Phaser scenes to communicate
 * bidirectionally without tight coupling.
 *
 * React → Phaser examples:
 * - EventBus.emit('teleport-player', { x: 100, y: 200, scene: 'WorldScene' })
 * - EventBus.emit('equip-item', { itemId: 'wizard-hat' })
 * - EventBus.emit('open-adventure', { adventureId: 'fraction-pizza-party' })
 *
 * Phaser → React examples:
 * - EventBus.emit('xp-gained', { amount: 50, source: 'adventure' })
 * - EventBus.emit('inventory-changed', { items: [...] })
 * - EventBus.emit('adventure-completed', { adventureId: '...', score: 85 })
 */

type EventCallback = (...args: any[]) => void;

class EventBusClass {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    return this;
  }

  off(event: string, callback?: EventCallback): this {
    if (!callback) {
      // Remove all listeners for this event
      this.events.delete(event);
    } else {
      // Remove specific callback
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]): this {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
    return this;
  }

  once(event: string, callback: EventCallback): this {
    const wrappedCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, wrappedCallback);
    };
    return this.on(event, wrappedCallback);
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}

// Export singleton instance
export const EventBus = new EventBusClass();
