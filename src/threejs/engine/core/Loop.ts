export type UpdateCallback = (delta: number, elapsed: number) => void;

export class Loop {
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private rafId: number | null = null;

  constructor(private onUpdate: UpdateCallback) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (time: number) => {
    if (!this.running) return;

    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.elapsed += delta;

    this.onUpdate(delta, this.elapsed);

    this.rafId = requestAnimationFrame(this.tick);
  };

  public getElapsed() {
    return this.elapsed;
  }
}
