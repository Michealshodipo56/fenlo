import { state } from './state.js';
import { uid } from './helpers.js';

const GUEST_KEY = 'fenlo.guestId';

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest_${uid()}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function getUserId() {
  return state.user?.id || getGuestId();
}
