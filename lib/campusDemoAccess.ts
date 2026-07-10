export function isCampusDemoMode(search: string | URLSearchParams): boolean {
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;

  return ['1', 'true', 'yes'].includes((params.get('demo') ?? '').toLowerCase());
}

export function isCampusDemoBypassPath(
  pathname: string,
  search: string | URLSearchParams,
): boolean {
  return pathname === '/world/campus' && isCampusDemoMode(search);
}

export function isNoAuthCampusDemoPath(
  pathname: string,
  search: string | URLSearchParams,
): boolean {
  return pathname === '/dev/campus-sandbox' || isCampusDemoBypassPath(pathname, search);
}
