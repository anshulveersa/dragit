export abstract class Animator {
  protected startedAt: number | null = null;
  private raf: number | null = null;
  protected stage: "initialized" | "in-progress" | "stopped" = "initialized";

  constructor() {}

  protected abstract frame(timestamp: number): void;

  private step = (timestamp: number) => {
    if (this.stage === "in-progress") {
      if (this.startedAt === null) this.startedAt = timestamp;

      this.frame(timestamp);

      this.raf = requestAnimationFrame(this.step);
    }
  };

  start() {
    this.stage = "in-progress";
    requestAnimationFrame(this.step);
  }

  stop() {
    this.stage = "stopped";
    if (this.raf !== null) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
}
