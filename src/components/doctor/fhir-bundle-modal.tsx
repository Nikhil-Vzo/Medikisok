import * as React from "react";
import { Copy, Check, Download, ShieldCheck, Link2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToFhirJson } from "@/lib/abdm/fhir-builder";

export interface FhirBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  fhirBundle: any;
  /** ABHA Address shown in the ABHA info chip */
  abhaAddress?: string;
}

export const FhirBundleModal: React.FC<FhirBundleModalProps> = ({
  isOpen,
  onClose,
  fhirBundle,
  abhaAddress
}) => {
  const [copied, setCopied] = React.useState(false);
  const jsonString = JSON.stringify(fhirBundle || {}, null, 2);

  // Extract ABHA info from the Patient resource in the bundle
  const patientEntry = fhirBundle?.entry?.find(
    (e: any) => e.resource?.resourceType === "Patient"
  );
  const abhaId = patientEntry?.resource?.identifier?.find(
    (id: any) => id.system === "https://healthid.abdm.gov.in" || id.system === "https://abdm.gov.in/abha-api/abha-number"
  )?.value;
  const healthIdExt = patientEntry?.resource?.extension?.find(
    (e: any) => e.url === "https://nrces.in/abha/StructureDefinition/HealthID"
  )?.valueString;
  const healthAddressExt = patientEntry?.resource?.extension?.find(
    (e: any) => e.url === "https://nrces.in/abha/StructureDefinition/HealthAddress"
  )?.valueString;
  const careContextExt = patientEntry?.resource?.extension?.find(
    (e: any) => e.url === "https://nrces.in/abha/StructureDefinition/CareContextLink"
  );
  const linkedOnExt = patientEntry?.resource?.extension?.find(
    (e: any) => e.url === "https://nrces.in/abha/StructureDefinition/LinkedOn"
  )?.valueDateTime;

  const resolvedAbhaId = abhaId || healthIdExt;
  const resolvedAbhaAddress = abhaAddress || healthAddressExt;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (fhirBundle) {
      exportToFhirJson(fhirBundle);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="HL7 FHIR R4 Clinical Bundle"
      subtitle="Standardized interoperability payload for ABDM and Hospital Information Systems"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* ABHA Linking Info Banner */}
        {resolvedAbhaId && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <Link2 className="w-3.5 h-3.5" />
              ABHA Linked
            </div>
            <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-white">
              Health ID: {resolvedAbhaId}
            </Badge>
            {resolvedAbhaAddress && (
              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-white">
                @{resolvedAbhaAddress}
              </Badge>
            )}
            {careContextExt?.extension?.[0]?.valueString && (
              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-white">
                Care Context: {careContextExt.extension[0].valueString}
              </Badge>
            )}
            {linkedOnExt && (
              <span className="text-xs text-emerald-600 ml-auto">
                Linked: {new Date(linkedOnExt).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}

        {/* Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Valid HL7 FHIR R4 · ABDM HIE Ready · DPDP 2023 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs font-semibold gap-1 text-emerald-950 border-emerald-200 hover:bg-emerald-50">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs font-semibold gap-1 text-emerald-950 border-emerald-200 hover:bg-emerald-50">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="relative rounded-xl bg-emerald-50/40 border border-emerald-200 p-4 text-xs text-emerald-950 overflow-x-auto max-h-[500px]">
          <pre className="font-medium leading-relaxed">{jsonString}</pre>
        </div>
      </div>
    </Modal>
  );
};
