export function decodeAuctionRouteParam(routeParam: string): string {
  try {
    return decodeURIComponent(routeParam);
  } catch {
    return routeParam;
  }
}

export function auctionIdPathSegment(auctionId: string | number): string {
  return encodeURIComponent(String(auctionId));
}

export function auctionDetailHref(auctionId: string | number): string {
  return `/auctions/${auctionIdPathSegment(auctionId)}`;
}

export function auctionLiveHref(auctionId: string | number): string {
  return `${auctionDetailHref(auctionId)}/live`;
}
