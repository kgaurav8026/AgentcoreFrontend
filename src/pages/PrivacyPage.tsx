// ============================================
// Privacy Policy Page
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-4 text-gray-600">Last updated: January 1, 2024</p>

        <div className="mt-8 prose prose-gray max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (organization, role)</li>
            <li>Usage data (features used, experiments run)</li>
            <li>Uploaded datasets and models</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            We use industry-standard security measures to protect your data. All data is
            encrypted at rest and in transit. We store data in secure cloud infrastructure
            with regular backups.
          </p>

          <h2>4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share information:</p>
          <ul>
            <li>With your consent</li>
            <li>With service providers who assist our operations</li>
            <li>To comply with legal obligations</li>
            <li>To protect rights and safety</li>
          </ul>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information about your
            browsing activities. You can control cookies through your browser settings.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed
            to provide services. We may retain certain information for legitimate business
            purposes or as required by law.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under 16. We do not knowingly collect
            information from children under 16.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@aimlflow.com.
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

export default PrivacyPage;
