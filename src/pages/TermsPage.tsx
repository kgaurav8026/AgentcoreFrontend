// ============================================
// Terms of Service Page
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AIMLFlow</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-4 text-gray-600">Last updated: January 1, 2024</p>

        <div className="mt-8 prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using AIMLFlow ("Service"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AIMLFlow is a machine learning platform that provides tools for data preparation,
            model training, experiment tracking, and model deployment. The Service is provided
            on an "as-is" basis.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. You agree to notify us immediately
            of any unauthorized use of your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Upload malicious code or content</li>
            <li>Attempt to gain unauthorized access to systems or data</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Resell or redistribute the Service without permission</li>
          </ul>

          <h2>5. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. By using the Service,
            you consent to the collection and use of data as described in the Privacy Policy.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by AIMLFlow
            and are protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall AIMLFlow be liable for any indirect, incidental, special, consequential,
            or punitive damages arising out of your use of the Service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any
            material changes via email or through the Service.
          </p>

          <h2>9. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@aimlflow.com.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
