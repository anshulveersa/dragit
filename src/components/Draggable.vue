<template>
  <slot :onmousedown="handleTargetMouseDown" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Scroller } from "../utils/Scroller";
import {
  createGhost,
  getContainerWithScrollingEdges,
  isHTMLElement,
} from "../utils/element";

const props = defineProps<{
  /** Makes the item resizable from specified sides or all if no value is given. */
  resizable?: boolean | Array<"top" | "right" | "bottom" | "left" | "x" | "y">;

  /** Snaps the item to vertical and horizontal center with the cursor when dragging.*/
  pickAtCenter?: boolean;

  axis?: "x" | "y";

  /** Snap to grid */
  snap?:
    | {
        x?: number;
        y?: number;
      }
    | number;

  /** Number of milliseconds to wait before the item is picked up for dragging. */
  pickDelay?: number;

  /** */
  autoScroll?: boolean;
}>();

const canResize = computed(() => {
  if (typeof props.resizable === "boolean")
    return {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };

  const resizableHandles = new Set(props.resizable);
  return {
    top: resizableHandles.has("y") || resizableHandles.has("top"),
    right: resizableHandles.has("x") || resizableHandles.has("right"),
    bottom: resizableHandles.has("y") || resizableHandles.has("bottom"),
    left: resizableHandles.has("x") || resizableHandles.has("left"),
  };
});

const snap = computed(() => {
  if (!props.snap) return { x: 1, y: 1 };

  if (typeof props.snap === "number") return { x: props.snap, y: props.snap };

  return {
    x: props.snap.x ?? 1,
    y: props.snap.y ?? 1,
  };
});

const containerScroller = new Scroller();

function handleTargetMouseDown(e: MouseEvent) {
  const draggedItem = e.currentTarget;
  if (!isHTMLElement(draggedItem)) return;
  /// Initialization

  // Create a clone of the originally picked up element
  const ghost = createGhost(draggedItem);
  draggedItem.style.visibility = "hidden";

  const mouseDownCoords = { x: e.clientX, y: e.clientY };

  const moveHandler = (moveEvent: MouseEvent) => {
    /// This should be debounced
    // Stop the existing scrolling animation if any
    containerScroller.stop();

    // Get the container at which the mouse pointer is currently at
    // and the container is scrollable
    const scrollableContainer = getContainerWithScrollingEdges(moveEvent);

    // If the user is aiming to scroll with drag
    if (scrollableContainer) {
      containerScroller.setProps(scrollableContainer.el, [
        {
          direction: scrollableContainer.proximity.horizontal.edge,
          speed: scrollableContainer.proximity.horizontal.value,
        },
        {
          direction: scrollableContainer.proximity.vertical.edge,
          speed: scrollableContainer.proximity.vertical.value,
        },
      ]);
      containerScroller.start();
    }

    const pointerDisplacement = {
      x: moveEvent.clientX - mouseDownCoords.x,
      y: moveEvent.clientY - mouseDownCoords.y,
    };

    const ghostTransformation = {
      x: Math.floor(pointerDisplacement.x / snap.value.x) * snap.value.x,
      y: Math.floor(pointerDisplacement.y / snap.value.y) * snap.value.y,
    };

    ghost.style.transform = `translate3d(${ghostTransformation.x}px, ${ghostTransformation.y}px, 0)`;
  };

  const exitHandler = (e: MouseEvent) => {
    // Stop the existing scrolling animation if any
    containerScroller?.stop();

    draggedItem.style.visibility = "visible";
    ghost.remove();

    const droppingCoords = {
      x: e.pageX,
      y: e.pageY,
    };

    const droppingElement = document.elementsFromPoint(e.clientX, e.clientY);

    document.removeEventListener("mouseup", exitHandler);
    document.removeEventListener("mousemove", moveHandler);
  };

  document.addEventListener("mouseup", exitHandler);
  document.addEventListener("mousemove", moveHandler);
}
</script>

<style scoped></style>
