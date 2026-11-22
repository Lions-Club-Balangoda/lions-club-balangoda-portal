'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { VOLUNTEER_AREAS_OF_INTEREST } from '../../types/volunteer.ts';

function VolunteerRegistrationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState<string>(VOLUNTEER_AREAS_OF_INTEREST[0]);
  const [motivationStatement, setMotivationStatement] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Client-side quick validation (AC2)
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    }
    if (!areaOfInterest) {
      errors.areaOfInterest = 'Please select your area of service interest.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim(),
          areaOfInterest,
          motivationStatement: motivationStatement.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setGeneralError(data.message || 'Unable to submit application. Please verify your entries.');
        }
        setIsLoading(false);
        return;
      }

      // Success State (AC5)
      setIsSuccess(true);
      setSuccessMessage(data.message);
      setReferenceId(data.applicationId || null);
    } catch {
      setGeneralError('Network connection issue. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setAreaOfInterest(VOLUNTEER_AREAS_OF_INTEREST[0]);
    setMotivationStatement('');
    setFieldErrors({});
    setGeneralError(null);
    setIsSuccess(false);
    setSuccessMessage(null);
    setReferenceId(null);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 md:p-12 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-3">
          Application Received Successfully
        </span>

        <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
          Welcome to the Lions Community!
        </h2>

        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {successMessage}
        </p>

        {referenceId && (
          <div className="my-6 inline-block rounded-xl bg-zinc-50 border border-zinc-200 px-5 py-3 text-xs font-mono text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-400 mr-2">Application Reference ID:</span>
            <span className="font-semibold text-blue-900 dark:text-amber-400">{referenceId}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
          >
            Submit Another Application
          </button>
          <Link
            href="/projects"
            className="w-full sm:w-auto rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition"
          >
            Explore Active Projects →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 md:p-12 shadow-xl border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mb-8">
        <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-amber-300 mb-2">
          Public Volunteer Intake • Balangoda
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Volunteer Registration Form
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Fill in your details below to join our humanitarian initiatives. Our club officers will reach out to you with upcoming service camps and activities.
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200 text-sm text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-semibold">Notice</p>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            maxLength={150}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. Ashen Silva"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white disabled:opacity-50 transition ${
              fieldErrors.fullName
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                : 'border-zinc-300 focus:border-blue-600 focus:ring-blue-600/20 dark:border-zinc-700'
            }`}
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. name@example.com"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white disabled:opacity-50 transition ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                  : 'border-zinc-300 focus:border-blue-600 focus:ring-blue-600/20 dark:border-zinc-700'
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              maxLength={50}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              placeholder="+94 77 123 4567"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white disabled:opacity-50 transition ${
                fieldErrors.phoneNumber
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500'
                  : 'border-zinc-300 focus:border-blue-600 focus:ring-blue-600/20 dark:border-zinc-700'
              }`}
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                {fieldErrors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Service Pillar / Area of Interest */}
        <div>
          <label
            htmlFor="areaOfInterest"
            className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1"
          >
            Area of Humanitarian Service Interest <span className="text-red-500">*</span>
          </label>
          <select
            id="areaOfInterest"
            name="areaOfInterest"
            required
            value={areaOfInterest}
            onChange={(e) => setAreaOfInterest(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
          >
            {VOLUNTEER_AREAS_OF_INTEREST.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {fieldErrors.areaOfInterest && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
              {fieldErrors.areaOfInterest}
            </p>
          )}
        </div>

        {/* Motivation / Skills Statement */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="motivationStatement"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Why would you like to volunteer? (Optional)
            </label>
            <span className="text-xs text-zinc-400">Max 2,000 characters</span>
          </div>
          <textarea
            id="motivationStatement"
            name="motivationStatement"
            rows={4}
            maxLength={2000}
            value={motivationStatement}
            onChange={(e) => setMotivationStatement(e.target.value)}
            disabled={isLoading}
            placeholder="Share your skills, availability, or previous volunteer experience..."
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50 transition"
          />
        </div>

        {/* Privacy Assurance (SEC-01) */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          🔒 <strong>Privacy Assurance:</strong> Your contact information is kept strictly confidential and used solely by the Lions Club of Balangoda committee to communicate service opportunities.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-900 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Registering Application...</span>
            </>
          ) : (
            <span>Submit Volunteer Registration</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-950 flex flex-col items-center">
      <Suspense fallback={<div className="h-96 w-full max-w-2xl bg-white rounded-3xl animate-pulse" />}>
        <VolunteerRegistrationForm />
      </Suspense>
    </div>
  );
}
