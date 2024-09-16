export function isValidUrl(url: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(url);
}
