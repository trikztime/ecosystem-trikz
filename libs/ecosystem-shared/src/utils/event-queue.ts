type EventPromise<T> = () => Promise<T>;
type EventCallback<T> = (result: Awaited<T> | Error | undefined) => void;

type Event<T> = {
  promise: EventPromise<T>;
  onResolve: EventCallback<T>;
};

export class EventQueue<T> {
  private events: Event<T>[] = [];
  private isProcessing = false;

  addEvent(promise: EventPromise<T>, onResolve: EventCallback<T>) {
    this.events.push({
      promise,
      onResolve,
    });
    this.checkEvent();
  }

  private async checkEvent() {
    if (this.isProcessing) return;
    if (this.events.length === 0) return;

    this.isProcessing = true;
    const event = this.events.shift();
    try {
      const result = await event?.promise();
      event?.onResolve(result);
    } catch (error) {
      if (error instanceof Error) {
        event?.onResolve(error);
      }
    }
    this.isProcessing = false;

    this.checkEvent();
  }
}
