import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max)
}

export function doRectsIntersect(rect1: DOMRect, rect2: DOMRect) {
    if (rect1.right < rect2.left || rect2.right < rect1.left) {
        return false;
    }
    return !(rect1.bottom < rect2.top || rect2.bottom < rect1.top);
}