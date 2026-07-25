import { Badge, Button } from "@lablnet/ui";
import { ArrowLeft, ShieldCheck, Lock, HardDrive, EyeOff, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPolicy() {
  return (
    <div className="mx-auto w-[min(1180px,calc(100%-1.25rem))] py-8 sm:w-[min(1180px,calc(100%-2rem))] sm:py-12">
      {/* Navigation back button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative mb-12 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                <ShieldCheck className="mr-1 size-3.5" /> Privacy First Architecture
              </Badge>
              <span className="text-xs text-slate-400">Effective Date: July 25, 2026</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-base text-slate-600">
              MorphFinder is built local-first. Your files, metadata, and data stay on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Privacy Notice */}
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <EyeOff className="size-5 text-blue-600" /> 1. Zero Tracking & No Telemetry
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              At Lablnet, we believe your file system is personal and private. <strong>MorphFinder does not track, collect, upload, or sell any of your files, folder structures, searches, or usage metrics.</strong>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              All file indexing, search cataloging, space analysis, and metadata extraction happen 100% locally on your machine.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <HardDrive className="size-5 text-emerald-600" /> 2. File Access & Apple App Sandbox
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              When distributed via the Mac App Store, MorphFinder operates within Apple's strict <strong>App Sandbox</strong>. The application only accesses directories and files you explicitly navigate to or drag into the interface.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
              <li>File contents are processed exclusively in-memory or stored in local app state caches.</li>
              <li>No file data is transmitted over the internet.</li>
              <li>Local application logs remain isolated within your local user profile.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Lock className="size-5 text-indigo-600" /> 3. Local Network & AirShare
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              MorphFinder includes an optional peer-to-peer <strong>AirShare</strong> feature for sending files between devices on your local Wi-Fi / LAN network.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              AirShare transfers occur directly over your local local area network (P2P). No external relay servers or cloud storage services are involved in your file transfers.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              4. Security & Compliance
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We employ standard macOS Hardened Runtime, Code Signing, and App Sandbox security features to protect your application binary from tampering. MorphFinder complies fully with Apple Developer Program security standards and international privacy regulations including GDPR and CCPA.
            </p>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
            <h3 className="font-bold text-slate-900">Privacy at a Glance</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">✓</span>
                <span>No analytics or tracking cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">✓</span>
                <span>No user account required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">✓</span>
                <span>Local-first processing & indexing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">✓</span>
                <span>100% compliant with Apple Sandbox</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900">Contact Us</h3>
            <p className="mt-2 text-sm text-slate-600">
              If you have any questions about this Privacy Policy or MorphFinder's architecture, contact the developer:
            </p>
            <a
              href="mailto:lablnet@icloud.com?subject=MorphFinder%20Privacy"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Mail size={16} /> lablnet@icloud.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
