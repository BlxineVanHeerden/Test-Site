function generatePrivacyPolicy(data) {
  const { siteName, country, collectEmail } = data;

  let policy = `
PRIVACY POLICY

Last updated: ${new Date().toDateString()}

This Privacy Policy explains how ${siteName} ("we", "us", or "our") collects, uses, and protects your personal information.

1. Information We Collect
`;

  if (collectEmail) {
    policy += `
- Email addresses provided voluntarily by users.
`;
  } else {
    policy += `
- We do not knowingly collect personal information.
`;
  }

  policy += `
2. How We Use Information
We use collected information only to operate and improve our website.

3. Data Protection
We take reasonable steps to protect your information.

4. Location
This website operates from ${country}.

5. Contact
If you have questions about this policy, please contact us through the website.
`;

  return policy.trim();
}
