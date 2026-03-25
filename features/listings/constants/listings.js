export const ROOM_TYPES = Object.freeze({
  ALL: 'All',
  SHARED: 'Shared',
  PRIVATE_ROOM: 'Private Room',
  BASEMENT: 'Basement',
  FULL_SUITE: 'Full Suite',
});

// home uses the all option, while create flow can stay more freeform
export const ROOM_TYPE_FILTER_OPTIONS = Object.freeze([
  ROOM_TYPES.ALL,
  ROOM_TYPES.SHARED,
  ROOM_TYPES.PRIVATE_ROOM,
  ROOM_TYPES.BASEMENT,
  ROOM_TYPES.FULL_SUITE,
]);
