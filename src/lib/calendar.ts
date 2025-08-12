// src/lib/calendar.ts
import { createEvent, EventAttributes } from "ics";

/**
 * Creates an ICS calendar event string from event attributes.
 * @param {EventAttributes} event - The event details.
 * @returns {Promise<string>} A promise that resolves with the ICS file content.
 */
export function createCalendarEvent(event: EventAttributes): Promise<string> {
  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(value);
    });
  });
}
