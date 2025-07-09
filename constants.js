export const WORLD_SCALE = 3.0;
export const SMOOTHING_FACTOR = 0.5; // between 0 (no update) and 1 (no smoothing)
export const MAX_MOVEMENT = 0.1;     // max allowed jump per frame

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];
