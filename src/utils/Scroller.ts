import { Direction, ScrollEdge } from "../types";
import { Animator } from "./Animator";

export class Scroller extends Animator {
  private element!: HTMLElement;
  private edges: ScrollEdge[] = [];

  constructor() {
    super();
  }

  setProps(element: HTMLElement, edges: ScrollEdge[]) {
    this.element = element;
    this.edges = edges;
  }

  protected frame(timestamp: number) {
    const elapsed = timestamp - this.startedAt!;

    for (const edge of this.edges) {
      const distanceToCover = (elapsed / 1000) * edge.speed * 10;

      switch (edge.direction) {
        case Direction.Up:
          this.element.scrollBy({ top: -distanceToCover });
          break;
        case Direction.Down:
          this.element.scrollBy({ top: distanceToCover });
          break;
        case Direction.Left:
          this.element.scrollBy({ left: -distanceToCover });
          break;
        case Direction.Right:
          this.element.scrollBy({ left: distanceToCover });
          break;
      }
    }
  }
}
