/** Booking rules that are not managed from the admin panel. */
export type PropertyType = 'apartment' | 'house' | 'office';
export const propertyTypes: PropertyType[] = ['apartment', 'house', 'office'];

export const ROOMS = { min: 1, max: 10, default: 2 } as const;
export const BATHROOMS = { min: 1, max: 5, default: 1 } as const;

/** Arrival windows offered in the estimator and booking wizard. */
export const TIME_SLOTS = [
  { id: '08-11', label: '8:00–11:00' },
  { id: '11-14', label: '11:00–14:00' },
  { id: '14-17', label: '14:00–17:00' },
  { id: '17-20', label: '17:00–20:00' },
] as const;
export type TimeSlotId = (typeof TIME_SLOTS)[number]['id'];

/** Booking window: from tomorrow up to N days ahead. */
export const BOOKING_WINDOW_DAYS = 60;
