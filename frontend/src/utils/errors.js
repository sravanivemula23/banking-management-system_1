/** Turns any thrown error into a message that is safe and useful to show to the user. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.userMessage || fallback;
}

/** Builds the friendly message from an Axios error. Called once, inside the response interceptor. */
export function buildUserMessage(error) {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The server took too long to respond. Please try again.'
      : 'Cannot reach the server. Check that the backend is running and the API URL is correct.';
  }
  const { status, data } = error.response;
  // Backend format: { timestamp, status, error, message, path, fieldErrors }
  if (status === 400 && data?.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.values(data.fieldErrors).join('. ');
  }
  if (status === 401) return data?.message || 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status >= 500) return 'The server ran into a problem. Please try again later.';
  return data?.message || 'Request failed.';
}
