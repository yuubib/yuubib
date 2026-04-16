export const MOTION = {
  page: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.24, ease: [0.2, 0.7, 0.1, 1] as const },
  },
  panel: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: [0.2, 0.7, 0.1, 1] as const },
  },
  modal: {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 8 },
    transition: { duration: 0.22, ease: [0.2, 0.7, 0.1, 1] as const },
  },
  listItemDelay(index: number) {
    return { delay: Math.min(index * 0.06, 0.28) };
  },
};
