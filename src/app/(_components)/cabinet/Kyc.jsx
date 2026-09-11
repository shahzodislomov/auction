"use client";

import { Alert, Button, Divider } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useUserContext } from "@/context/UserContext";
import KycDocumentPicker from "@/components/user-v2/KycDocumentPicker";
import KycStatusPanel from "@/components/user-v2/KycStatusPanel";
import {
  createUnavailableKycStatus,
  getKycDocumentRequirements,
} from "@/features/user-v2/kyc.mjs";

export default function Kyc() {
  const { user } = useUserContext();
  const status = createUnavailableKycStatus();
  const requirements = getKycDocumentRequirements(user?.type || "INDIVIDUAL");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        <FormattedMessage id="kyc.title" />
      </h1>
      <Divider className="my-4" />

      <KycStatusPanel status={status} userType={user?.type || "INDIVIDUAL"} />

      <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          <FormattedMessage id="kyc.documents" />
        </h2>
        <Alert severity="info">
          <FormattedMessage id="kyc.safe_foundation_note" />
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.acceptedTypes.map((type) => (
            <KycDocumentPicker
              key={type}
              documentType={type}
              policy={null}
              disabled
            />
          ))}
        </div>

        <Button variant="contained" disabled>
          <FormattedMessage id="kyc.submit" />
        </Button>
      </section>
    </div>
  );
}
