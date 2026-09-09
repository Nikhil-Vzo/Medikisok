"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLink,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { InstallPwaButton } from "@/components/shared/install-pwa-button";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1b3573] text-white antialiased selection:bg-white/20 selection:text-white border-t border-[#2a4a98]">
      {/* Main 4-Column Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Col 1: Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white">Contact</h3>

            <div className="space-y-3 text-xs text-blue-100 leading-relaxed font-normal">
              <div>
                <span className="font-semibold text-white block mb-0.5">Hospital & Desk Address</span>
                <p className="opacity-90">
                  All India Institute of Ayurveda (AIIA), Mathura Road, Gautampuri, Sarita Vihar, New Delhi - 110076
                </p>
              </div>

              <div>
                <span className="font-semibold text-white block mb-0.5">Toll Free Helpdesk</span>
                <p className="font-mono text-sm font-bold text-white tracking-wide">
                  1800-11-4477
                </p>
                <span className="text-[11px] text-blue-200/80">National Health Authority / ABDM Support</span>
              </div>

              <div>
                <span className="font-semibold text-white block mb-0.5">Email</span>
                <a
                  href="mailto:abdm@nha.gov.in"
                  className="hover:underline text-blue-200 font-mono text-[11px] block"
                >
                  abdm[at]nha[dot]gov[dot]in
                </a>
                <a
                  href="mailto:contact@aiia.gov.in"
                  className="hover:underline text-blue-200 font-mono text-[11px] block mt-0.5"
                >
                  contact[at]aiia[dot]gov[dot]in
                </a>
              </div>
            </div>

            {/* Social Media Rounded White Tiles */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-white block mb-2">Social Media</span>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded bg-white text-[#1b3573] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded bg-white text-[#1b3573] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 rounded bg-white text-[#1b3573] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded bg-white text-[#1b3573] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Features We Offer (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-white">Features We Offer</h3>
            <ul className="space-y-2 text-xs text-blue-100 font-normal leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/kiosk" className="hover:text-white hover:underline transition-colors">
                  Multilingual Voice & Touch Intake (8 Indic Languages)
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/doctor" className="hover:text-white hover:underline transition-colors">
                  Vision AI & OCR Prescription Digitizer
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/doctor" className="hover:text-white hover:underline transition-colors">
                  Pre-Structured SOAP & Ayush Dashavidha Pariksha
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/kiosk" className="hover:text-white hover:underline transition-colors">
                  Longitudinal Gap-Adaptive Triage Engine
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/desk" className="hover:text-white hover:underline transition-colors">
                  ABDM FHIR R4 Bundling & DPDP Digital Consent
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/doctor" className="hover:text-white hover:underline transition-colors">
                  Real-Time Emergency Red-Flag Detection
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <Link href="/doctor" className="hover:text-white hover:underline transition-colors">
                  Clinician OPD Console with 2-Minute Target Timer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Standards & Policies (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-white">Policies & Standards</h3>
            <ul className="space-y-2 text-xs text-blue-100 font-normal leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  Ayushman Bharat Digital Mission (ABDM)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  Ayushman Bharat Health Account (ABHA)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  Digital Personal Data Protection (DPDP) Act 2023
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  FHIR R4 Electronic Health Record Standard
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  National Ayush Morbidity & Standardized Codes (NAMASTE)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  Health Data Management & ALCOA+ Audit Trails
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span className="hover:text-white transition-colors cursor-default">
                  Website Policies & Accessibility Guidelines (GIGW)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: MediKiosk Terminal & App (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-white">MediKiosk Terminal</h3>
            <p className="text-xs text-blue-200">
              Scan with your phone to launch patient self-service intake or access hospital desk.
            </p>

            {/* QR Code & Scan instruction */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <svg
                  className="w-24 h-24"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Background */}
                  <rect width="100" height="100" fill="white" />
                  
                  {/* Top-Left Position Detection Pattern */}
                  <rect x="6" y="6" width="28" height="28" fill="#1b3573" rx="4" />
                  <rect x="10" y="10" width="20" height="20" fill="white" rx="2" />
                  <rect x="14" y="14" width="12" height="12" fill="#1b3573" rx="2" />

                  {/* Top-Right Position Detection Pattern */}
                  <rect x="66" y="6" width="28" height="28" fill="#1b3573" rx="4" />
                  <rect x="70" y="10" width="20" height="20" fill="white" rx="2" />
                  <rect x="74" y="14" width="12" height="12" fill="#1b3573" rx="2" />

                  {/* Bottom-Left Position Detection Pattern */}
                  <rect x="6" y="66" width="28" height="28" fill="#1b3573" rx="4" />
                  <rect x="10" y="70" width="20" height="20" fill="white" rx="2" />
                  <rect x="14" y="74" width="12" height="12" fill="#1b3573" rx="2" />

                  {/* Timing Patterns & Data Modules */}
                  <rect x="38" y="10" width="4" height="4" fill="#1b3573" />
                  <rect x="46" y="10" width="4" height="4" fill="#1b3573" />
                  <rect x="54" y="10" width="4" height="4" fill="#1b3573" />
                  <rect x="38" y="18" width="4" height="4" fill="#1b3573" />
                  <rect x="54" y="18" width="4" height="4" fill="#1b3573" />
                  <rect x="38" y="26" width="4" height="4" fill="#1b3573" />
                  <rect x="46" y="26" width="4" height="4" fill="#1b3573" />
                  <rect x="54" y="26" width="4" height="4" fill="#1b3573" />

                  <rect x="10" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="18" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="26" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="10" y="54" width="4" height="4" fill="#1b3573" />
                  <rect x="26" y="54" width="4" height="4" fill="#1b3573" />

                  <rect x="66" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="74" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="82" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="90" y="38" width="4" height="4" fill="#1b3573" />
                  <rect x="70" y="46" width="4" height="4" fill="#1b3573" />
                  <rect x="86" y="46" width="4" height="4" fill="#1b3573" />
                  <rect x="66" y="54" width="4" height="4" fill="#1b3573" />
                  <rect x="78" y="54" width="4" height="4" fill="#1b3573" />
                  <rect x="90" y="54" width="4" height="4" fill="#1b3573" />

                  <rect x="38" y="66" width="4" height="4" fill="#1b3573" />
                  <rect x="46" y="66" width="4" height="4" fill="#1b3573" />
                  <rect x="54" y="66" width="4" height="4" fill="#1b3573" />
                  <rect x="38" y="74" width="4" height="4" fill="#1b3573" />
                  <rect x="50" y="74" width="4" height="4" fill="#1b3573" />
                  <rect x="42" y="82" width="4" height="4" fill="#1b3573" />
                  <rect x="54" y="82" width="4" height="4" fill="#1b3573" />
                  <rect x="38" y="90" width="4" height="4" fill="#1b3573" />
                  <rect x="46" y="90" width="4" height="4" fill="#1b3573" />

                  <rect x="66" y="66" width="6" height="6" fill="#1b3573" />
                  <rect x="76" y="66" width="6" height="6" fill="#1b3573" />
                  <rect x="86" y="66" width="6" height="6" fill="#1b3573" />
                  <rect x="70" y="76" width="6" height="6" fill="#1b3573" />
                  <rect x="80" y="76" width="6" height="6" fill="#1b3573" />
                  <rect x="66" y="86" width="6" height="6" fill="#1b3573" />
                  <rect x="76" y="86" width="6" height="6" fill="#1b3573" />
                  <rect x="86" y="86" width="6" height="6" fill="#1b3573" />

                  {/* Center Heart Emblem (matching Aarogya Setu / ABDM style) */}
                  <rect x="40" y="40" width="20" height="20" fill="white" rx="4" />
                  <path
                    d="M50 56s-7-4.4-7-8.5a3.5 3.5 0 0 1 6-2.4l1 1.1 1-1.1a3.5 3.5 0 0 1 6 2.4c0 4.1-7 8.5-7 8.5z"
                    fill="#f59e0b"
                  />
                  <circle cx="50" cy="49" r="1.5" fill="#10b981" />
                </svg>
              </div>

              <div className="text-xs text-blue-100 font-medium leading-tight space-y-1">
                <p className="text-[11px] font-semibold text-white">
                  Scan with your phone camera to install.
                </p>
                <div className="w-10 h-0.5 bg-amber-400 rounded-full" />
                <p className="text-[10px] text-blue-200/80">
                  Instant intake access & ABHA card registration
                </p>
              </div>
            </div>

            {/* Install Web App (PWA) Button */}
            <div className="pt-2">
              <InstallPwaButton variant="footer" />
            </div>

          </div>

        </div>
      </div>

      {/* Sub-Footer Strip (Separated by thin divider) */}
      <div className="border-t border-white/15 bg-[#162a56]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-200">
          <p className="text-center sm:text-left">
            This Website belongs to All India Institute of Ayurveda (AIIA), Ministry of Ayush &amp; National Health Authority, Government of India
          </p>
          <p className="text-center sm:text-right font-medium text-blue-300 whitespace-nowrap">
            Page last updated on: 09/09/2026
          </p>
        </div>
      </div>
    </footer>
  );
};
