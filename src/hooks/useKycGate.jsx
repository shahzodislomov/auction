"use client";

import { useMemo } from "react";
import {
  createUnavailableKycStatus,
  evaluateKycGate,
} from "@/features/user-v2/kyc.mjs";

export default function useKycGate(target = "action", status = createUnavailableKycStatus()) {
  return useMemo(() => evaluateKycGate(status, target), [status, target]);
}
