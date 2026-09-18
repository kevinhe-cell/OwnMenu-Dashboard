import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { OWNMENU_SUPPORT_PHONES, formatUsPhone10 } from "../../constants/supportPhones";

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <div className="footer text-center py-2 bg-white border-top">
        <div className="copyright text-muted small">
          <p>
            © 2026{" "}
            <a href="/" rel="noreferrer">
              OwnMenu
            </a>{" "}
            |{" "}
            <a
              href={`tel:+1${OWNMENU_SUPPORT_PHONES.customerSupport}`}
              rel="noreferrer"
            >
              Customer support {formatUsPhone10(OWNMENU_SUPPORT_PHONES.customerSupport)}
            </a>{" "}
            |{" "}
            <a href={`tel:+1${OWNMENU_SUPPORT_PHONES.ownMenu}`} rel="noreferrer">
              OwnMenu {formatUsPhone10(OWNMENU_SUPPORT_PHONES.ownMenu)}
            </a>{" "}
            |{" "}
            <button
              className="btn btn-sm btn-link p-0"
              onClick={() => setShowTerms(true)}
            >
              Terms of Service
            </button>{" "}
            |{" "}
            <button
              className="btn btn-sm btn-link p-0"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      <Modal
        show={showTerms}
        onHide={() => setShowTerms(false)}
        size="lg"
        scrollable
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Terms of Service</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              paddingRight: "1rem",
            }}
          >
            <h2>Terms of Service</h2>
            <p>
              <strong>Effective Date:</strong> March 1, 2026
            </p>

            <p>
              Welcome to <strong>OwnMenu.com</strong> (“OwnMenu”, “we”, “our”,
              or “us”). By accessing or using our website, software, or services
              (“Services”), you agree to be bound by these Terms of Service
              (“Terms”).
            </p>

            <p>
              If you do not agree to these Terms, please do not use our
              Services.
            </p>

            <h4>1. Eligibility</h4>
            <p>
              You must be at least 18 years old and able to form a binding
              contract to use OwnMenu. By using the Services, you represent and
              warrant that you meet these requirements.
            </p>

            <h4>2. Services</h4>
            <p>
              OwnMenu provides restaurants with tools to create websites, manage
              online ordering, integrate with third-party platforms (e.g.,
              Stripe, Instagram), and automate marketing campaigns.
            </p>

            <h4>3. Accounts</h4>
            <p>
              You are responsible for maintaining the confidentiality of your
              login credentials. You agree to notify us immediately of any
              unauthorized access to your account.
            </p>

            <h4>4. Subscription and Billing</h4>
            <ul>
              <li>
                Some features require a paid subscription. Pricing and terms are
                disclosed at purchase.
              </li>
              <li>
                Payments are securely processed through third-party providers
                like Stripe.
              </li>
              <li>
                You authorize us to charge your selected payment method on a
                recurring basis.
              </li>
              <li>All fees are non-refundable unless otherwise stated.</li>
            </ul>

            <h4>5. User Content</h4>
            <p>
              You may upload content (menus, images, descriptions, etc.). You
              retain ownership, but by submitting content, you grant OwnMenu a
              non-exclusive, worldwide license to use, display, and distribute
              it solely for operating and promoting the Service.
            </p>
            <p>Prohibited content includes (but is not limited to):</p>
            <ul>
              <li>Illegal, misleading, or defamatory content</li>
              <li>Copyrighted material without permission</li>
              <li>Malware, spam, or abusive material</li>
            </ul>

            <h4>6. Third-Party Services</h4>
            <p>
              Our Services integrate with third parties like Stripe, Instagram,
              and Twilio. You agree to abide by their terms when using such
              features. We are not responsible for their performance or data
              handling.
            </p>

            <h4>7. Termination</h4>
            <p>
              We reserve the right to suspend or terminate your account at any
              time for violating these Terms. You may cancel your subscription
              anytime via your account dashboard.
            </p>

            <h4>8. Intellectual Property</h4>
            <p>
              All OwnMenu content, software, branding, and code are the property
              of OwnMenu LLC and may not be used or copied without written
              permission.
            </p>

            <h4>9. Limitation of Liability</h4>
            <p>
              To the fullest extent permitted by law, OwnMenu shall not be
              liable for any indirect, incidental, or consequential damages
              resulting from your use of the Services.
            </p>

            <h4>10. Disclaimer</h4>
            <p>
              The Services are provided “as is” and “as available” without
              warranties of any kind, express or implied.
            </p>

            <h4>11. Governing Law</h4>
            <p>
              These Terms are governed by the laws of the State of Delaware,
              USA, without regard to its conflict of law principles.
            </p>

            <h4>12. Changes to Terms</h4>
            <p>
              We may update these Terms from time to time. We will notify you
              via email or dashboard alert. Continued use of the Services
              indicates your acceptance of the new Terms.
            </p>

            <h4>13. Contact</h4>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>
                Phone:{" "}
                <a href="tel:+18888738885">888-873-8885</a>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:tan@ownmenu.com">tan@ownmenu.com</a>
              </li>
              <li>
                Website:{" "}
                <a href="https://ownmenu.com" target="_blank" rel="noreferrer">
                  ownmenu.com
                </a>
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTerms(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        show={showPrivacy}
        onHide={() => setShowPrivacy(false)}
        size="lg"
        scrollable
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <p>
            <div>
              <h2>Privacy Policy</h2>
              <p>
                <strong>Last updated:</strong> March 1, 2026
              </p>

              <p>
                This Privacy Policy describes Our policies and procedures on the
                collection, use and disclosure of Your information when You use
                the Service and tells You about Your privacy rights and how the
                law protects You.
              </p>

              <p>
                We use Your Personal data to provide and improve the Service. By
                using the Service, You agree to the collection and use of
                information in accordance with this Privacy Policy.
              </p>

              <h4>Interpretation and Definitions</h4>
              <h5>Interpretation</h5>
              <p>
                Words with capitalized first letters have defined meanings.
                These definitions apply whether they appear in singular or
                plural form.
              </p>

              <h5>Definitions</h5>
              <ul>
                <li>
                  <strong>Account:</strong> A unique account created to access
                  our Service.
                </li>
                <li>
                  <strong>Affiliate:</strong> An entity that controls, is
                  controlled by, or is under common control with the Company.
                </li>
                <li>
                  <strong>Company:</strong> OwnMenu LLC, 1662 Elesmere Oak
                  Court, Duluth, GA 30097.
                </li>
                <li>
                  <strong>Cookies:</strong> Small files placed on Your device
                  that track browsing history.
                </li>
                <li>
                  <strong>Country:</strong> United States (Georgia)
                </li>
                <li>
                  <strong>Device:</strong> Any device that can access the
                  Service (e.g., mobile, tablet, desktop).
                </li>
                <li>
                  <strong>Personal Data:</strong> Any information that relates
                  to an identified individual.
                </li>
                <li>
                  <strong>Service:</strong> The OwnMenu website and services.
                </li>
                <li>
                  <strong>Service Provider:</strong> Third parties that process
                  data on our behalf.
                </li>
                <li>
                  <strong>Third-party Social Media Service:</strong> External
                  platforms through which You log into our Service (e.g.,
                  Google, Facebook).
                </li>
                <li>
                  <strong>Usage Data:</strong> Data collected automatically from
                  using the Service.
                </li>
                <li>
                  <strong>Website:</strong> OwnMenu, accessible from{" "}
                  <a href="https://ownmenu.com" target="_blank">
                    ownmenu.com
                  </a>
                </li>
                <li>
                  <strong>You:</strong> The user accessing or using the Service.
                </li>
              </ul>

              <h4>Collecting and Using Your Personal Data</h4>
              <h5>Types of Data Collected</h5>

              <h6>Personal Data</h6>
              <p>We may collect personal information such as:</p>
              <ul>
                <li>Email address</li>
                <li>First and last name</li>
                <li>Phone number</li>
                <li>Address, State, ZIP/Postal code, City</li>
                <li>Usage Data</li>
              </ul>

              <h6>Usage Data</h6>
              <p>
                Automatically collected and may include IP address, browser
                type, pages visited, time spent, and more.
              </p>

              <h5>Third-Party Social Media Services</h5>
              <p>
                If you log in via a third-party service (e.g., Google,
                Instagram), we may access data tied to your account.
              </p>

              <h5>Tracking Technologies and Cookies</h5>
              <p>
                We use cookies and similar technologies to enhance and analyze
                your experience. Types include:
              </p>
              <ul>
                <li>
                  <strong>Essential Cookies:</strong> For core functionality.
                </li>
                <li>
                  <strong>Notice Acceptance Cookies:</strong> Remember your
                  cookie preferences.
                </li>
                <li>
                  <strong>Functionality Cookies:</strong> Remember choices like
                  login or language.
                </li>
              </ul>

              <h5>Use of Your Personal Data</h5>
              <p>We use your data to:</p>
              <ul>
                <li>Provide and maintain the Service</li>
                <li>Manage Your Account</li>
                <li>Process transactions and contracts</li>
                <li>Send service updates and offers</li>
                <li>Analyze usage and improve the platform</li>
              </ul>

              <h5>Sharing of Your Data</h5>
              <p>We may share data:</p>
              <ul>
                <li>With Service Providers</li>
                <li>During business transfers</li>
                <li>With affiliates or business partners</li>
                <li>When you interact with other users</li>
                <li>With your consent</li>
              </ul>

              <h5>Retention of Your Data</h5>
              <p>
                We retain data only as long as necessary to fulfill legal and
                operational obligations.
              </p>

              <h5>Transfer of Data</h5>
              <p>
                Data may be transferred to other jurisdictions. We ensure
                safeguards are in place.
              </p>

              <h5>Delete Your Data</h5>
              <p>
                You can request deletion of your data via your account or by
                contacting us.
              </p>

              <h5>Disclosure of Data</h5>
              <ul>
                <li>For business transactions</li>
                <li>To comply with law enforcement</li>
                <li>To protect rights, safety, and investigate misconduct</li>
              </ul>

              <h5>Security</h5>
              <p>
                We implement security best practices but cannot guarantee 100%
                protection.
              </p>

              <h5>Children's Privacy</h5>
              <p>
                We do not knowingly collect information from anyone under 13. If
                found, we will delete it.
              </p>

              <h5>Links to Other Sites</h5>
              <p>
                We are not responsible for the privacy practices of third-party
                websites linked from our platform.
              </p>

              <h5>Changes to This Policy</h5>
              <p>
                We may update this Privacy Policy and will notify users via
                email or notice on the site.
              </p>

              <h5>Contact Us</h5>
              <p>
                If you have questions about this Privacy Policy, contact us at:
              </p>
              <ul>
                <li>
                  Phone:{" "}
                  <a href="tel:+18888738885">888-873-8885</a>
                </li>
                <li>
                  Email:{" "}
                  <a href="mailto:tan@ownmenu.com">tan@ownmenu.com</a>
                </li>
                <li>
                  Website:{" "}
                  <a href="https://ownmenu.com/contact.html" target="_blank">
                    ownmenu.com/contact.html
                  </a>
                </li>
              </ul>
            </div>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrivacy(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Footer;
