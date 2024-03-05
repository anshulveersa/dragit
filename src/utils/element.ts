import { Direction } from "../types";

export function getEdgesProximity(
  element: HTMLElement,
  pointerEvent: MouseEvent | PointerEvent,
  activationLength: number
) {
  let rect = {
    left: element.offsetLeft,
    top: element.offsetTop,
    right: element.offsetLeft + element.offsetWidth,
    bottom: element.offsetTop + element.offsetHeight,
  };

  let pointer = {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  };

  if (element === document.documentElement) {
    rect = {
      left: 0,
      top: 0,
      right: element.clientWidth,
      bottom: element.clientHeight,
    };

    pointer = {
      x: pointerEvent.clientX,
      y: pointerEvent.clientY,
    };
  }

  const distanceFromLeftEdge = pointer.x - rect.left;
  const distanceFromRightEdge = rect.right - pointer.x;

  const horizontalEdgesProximity =
    -Math.max(
      (activationLength - distanceFromLeftEdge) / activationLength,
      0
    ) ||
    Math.max((activationLength - distanceFromRightEdge) / activationLength, 0);

  const distanceFromTopEdge = pointer.y - rect.top;
  const distanceFromBottomEdge = rect.bottom - pointer.y;

  const verticalEdgesProximity =
    -Math.max((activationLength - distanceFromTopEdge) / activationLength, 0) ||
    Math.max((activationLength - distanceFromBottomEdge) / activationLength, 0);

  return {
    horizontal: {
      edge: horizontalEdgesProximity < 0 ? Direction.Left : Direction.Right,
      value: Math.abs(horizontalEdgesProximity),
    },
    vertical: {
      edge: verticalEdgesProximity < 0 ? Direction.Up : Direction.Down,
      value: Math.abs(verticalEdgesProximity),
    },
  } as const;
}

export function getContainerWithScrollingEdges(pointerEvent: MouseEvent) {
  const activationThreshold = 100;

  const parentContainers = document.elementsFromPoint(
    pointerEvent.clientX,
    pointerEvent.clientY
  );

  for (const container of parentContainers) {
    if (!isHTMLElement(container)) continue;

    const proximity = getEdgesProximity(
      container,
      pointerEvent,
      activationThreshold
    );

    const canScrollContainer = isScrollable(container);

    if (
      (canScrollContainer[proximity.vertical.edge] &&
        proximity.vertical.value) ||
      (canScrollContainer[proximity.horizontal.edge] &&
        proximity.horizontal.value)
    )
      return { el: container, proximity };
  }
}

export function isScrollable(element: HTMLElement) {
  const styles = getComputedStyle(element);

  let rect = {
    height: element.offsetHeight,
    width: element.offsetWidth,
  };
  if (element === document.documentElement) {
    rect = {
      height: element.clientHeight,
      width: element.clientWidth,
    };
  }

  const canScroll = {
    [Direction.Up]: false,
    [Direction.Down]: false,
    [Direction.Left]: false,
    [Direction.Right]: false,
  };

  if (styles.overflow === "hidden") return canScroll;

  const overflowingY = element.scrollHeight > rect.height;
  const canOverflowY = styles.overflowY !== "hidden";
  if (overflowingY && canOverflowY) {
    canScroll[Direction.Up] = element.scrollTop !== 0;
    canScroll[Direction.Down] =
      Math.ceil(element.scrollTop + rect.height) < element.scrollHeight;
  }

  const overflowingX = element.scrollWidth > rect.width;
  const canOverflowX = styles.overflowX !== "hidden";
  if (overflowingX && canOverflowX) {
    canScroll[Direction.Left] = element.scrollLeft !== 0;
    canScroll[Direction.Right] =
      Math.ceil(element.scrollLeft + rect.width) < element.scrollWidth;
  }

  return canScroll;
}

export function isHTMLElement(target: any): target is HTMLElement {
  return target instanceof HTMLElement;
}

export function createGhost(target: HTMLElement) {
  const ghost = target.cloneNode(true) as HTMLElement;

  const targetRect = target.getBoundingClientRect();

  ghost.style.position = "fixed";
  ghost.style.top = `${targetRect.top}px`;
  ghost.style.left = `${targetRect.left}px`;
  ghost.style.width = `${targetRect.width}px`;
  ghost.style.height = `${targetRect.height}px`;
  ghost.style.boxSizing = "border-box";
  ghost.style.userSelect = "none";

  target.parentElement?.appendChild(ghost);

  return ghost;
}
