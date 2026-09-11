"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/api";
import { requireMutationSuccess } from "@/queries/mutationResponse";

export interface PaymentRecord {
  id?: string | number;
  paymentId?: string | number;
  auctionId?: string | number;
  amount?: number | string;
  currency?: string;
  type?: string;
  paymentType?: string;
  paymentMethod?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  paidAt?: string;
  paymentTime?: string;
}

export interface PaymentsPage {
  list: PaymentRecord[];
  page: number;
  size: number;
  pages: number;
  elements: number;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;

function findList(value: unknown, depth = 0): PaymentRecord[] {
  if (Array.isArray(value)) return value as PaymentRecord[];
  const source = asRecord(value);
  if (!source || depth > 4) return [];
  for (const key of ["list", "content", "items", "payments", "dtoList", "data", "meta"]) {
    const result = findList(source[key], depth + 1);
    if (result.length || Array.isArray(source[key])) return result;
  }
  return [];
}

function findMeta(value: unknown, depth = 0): UnknownRecord {
  const source = asRecord(value);
  if (!source || depth > 4) return {};
  if (["pages", "totalPages", "elements", "totalElements", "number", "page"].some((key) => key in source)) {
    return source;
  }
  return findMeta(source.meta ?? source.data, depth + 1);
}

function paymentPage(value: unknown, page: number, size: number): PaymentsPage {
  const list = findList(value);
  const meta = findMeta(value);
  return {
    list,
    page: Number(meta.number ?? meta.page ?? page),
    size: Number(meta.size ?? size),
    pages: Number(meta.pages ?? meta.totalPages ?? (list.length < size ? page + 1 : page + 2)),
    elements: Number(meta.elements ?? meta.totalElements ?? list.length),
  };
}

export async function fetchMyPayments(page = 0, size = 20): Promise<PaymentsPage> {
  const { data } = await api.get("/payments/mine", { params: { page, size } });
  return paymentPage(data, page, size);
}

export function useMyPayments(accountScope: string | number, page = 0, size = 20) {
  return useQuery({
    queryKey: ["payments", "mine", String(accountScope), page, size],
    queryFn: () => fetchMyPayments(page, size),
    enabled: Boolean(accountScope),
  });
}

export async function fetchPayment(paymentId: string | number) {
  const { data } = await api.get(`/payments/${paymentId}`);
  return data?.data ?? data;
}

export async function fetchAuctionPayments(auctionId: string | number) {
  const { data } = await api.get(`/payments/by-auction/${auctionId}`);
  return data?.data ?? data;
}

export async function recordAuctionFee(payload: {
  auctionId: string | number;
  amount?: number;
  percent?: number;
  paymentMethod?: "WALLET" | "CARD" | "CARD_INTL" | "PAYPAL" | "BANK_TRANSFER" | "PAYME" | "CLICK" | "UZUM";
}) {
  const { data } = await api.post("/payments/fee", payload);
  return requireMutationSuccess(data);
}

export async function payAuctionFromWallet(auctionId: string | number) {
  const { data } = await api.post(`/payments/auctions/${auctionId}/pay-wallet`);
  return requireMutationSuccess(data);
}

export function usePayAuctionFromWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payAuctionFromWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
    },
  });
}

export async function fetchPaymentTypes() {
  const { data } = await api.get("/payment/getAllPaymentType");
  return data?.data ?? data;
}

export async function fetchPaymentStatuses() {
  const { data } = await api.get("/payment/getAllPaymentStatus");
  return data?.data ?? data;
}

export async function fetchPaymentMethods() {
  const { data } = await api.get("/payment/getAllPaymentMethod");
  return data?.data ?? data;
}
