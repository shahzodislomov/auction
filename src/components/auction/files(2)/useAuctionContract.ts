import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

/**
 * Seller/winner identity now comes from `auction.seller.id` + the winning
 * bid + `useUserById`, so the only thing this file still needs from the
 * backend is the two-party confirmation state itself — that can't be
 * derived from anything already fetched, since it has to be true for both
 * browsers/sessions at once.
 *
 * ASSUMPTION (adjust paths to match your backend):
 *   GET  /auctions/{auctionId}/contract   -> AuctionContractState
 *   POST /auctions/{auctionId}/contract/confirm  body: { userId }
 *        -> AuctionContractState
 *
 * If your backend instead adds `sellerConfirmed`/`buyerConfirmed` straight
 * onto the auction/lot object (the way `finalPrice` already exists but is
 * unset), you can delete the GET query below and read those two fields off
 * `auction` directly in AuctionSaleGate instead.
 */
export interface AuctionContractState {
  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
}

export function useAuctionContract(auctionId: string, enabled: boolean) {
  return useQuery<AuctionContractState>({
    queryKey: ["auctionContract", auctionId],
    queryFn: async () => {
      const response = await api.get(`/auctions/${auctionId}/contract`);
      return (response.data?.data ?? response.data) as AuctionContractState;
    },
    enabled: enabled && Boolean(auctionId),
    refetchInterval: (query) => {
      const state = query.state.data;
      if (!state) return 5_000;
      return state.sellerConfirmed && state.buyerConfirmed ? false : 5_000;
    },
  });
}

export function useConfirmAuctionContract(auctionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/auctions/${auctionId}/contract/confirm`, {
        userId,
      });
      return (response.data?.data ?? response.data) as AuctionContractState;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auctionContract", auctionId], data);
      void queryClient.invalidateQueries({ queryKey: ["auctionContract", auctionId] });
    },
  });
}
