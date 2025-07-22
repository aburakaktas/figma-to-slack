### **Product Requirements Document: Lightweight Figma-to-Slack Connector (V5 - Internal Tool)**

**1. Introduction**

This document outlines the product requirements for a lightweight, internal tool designed to send real-time notifications from a specific Figma file to a designated Slack channel. The architecture prioritizes security, robustness, and ease of management for a single administrator, and is optimized for deployment on platforms like Vercel.

**2. Vision and Goal**

To create a secure, reliable, and "set-it-and-forget-it" communication bridge between a team's core Figma design system file and their Slack workspace. The tool will manage a single, one-to-one connection and provide clear feedback to the administrator, ensuring trust and minimal maintenance.

**3. User Personas**

*   **Administrator (Primary User):** The single user who will set up, configure, and manage the integration.
*   **Designers / Team Members (Secondary Users):** The individuals working in the connected Figma file; the source of the events.
*   **Developers / Stakeholders:** The consumers of the information in the Slack channel.

**4. Administrator-Centric User Stories**

*   **As the Administrator,** I want to use a simple web page to manage my connection settings, so I don't have to edit code for routine changes.
*   **As the Administrator,** I want to store my secret tokens securely in Vercel's Environment Variables, separate from my configuration, to follow security best practices.
*   **As the Administrator,** I want the configuration page to always load my saved settings, so I can easily view or update them.
*   **As the Administrator,** I want a "Save" button that intelligently handles creating, updating, or repairing the connection.
*   **As the Administrator,** I want to see clear, specific error messages in the UI if an action fails, so I can diagnose and fix the problem quickly.

**5. Features**

**5.1. Single-Page Admin Dashboard (The UI)**

A single, stateful web interface for all non-secret configuration.

*   **Prerequisites & Instructions:**
    *   The UI will not have input fields for secret tokens.
    *   Instead, it will display a clear prerequisite message instructing the administrator to set `FIGMA_PAT` and `SLACK_BOT_TOKEN` in the **Environment Variables** section of the Vercel project settings.
*   **Stateful Configuration Display:**
    *   On page load, the application will read the saved, non-secret configuration from Vercel KV and pre-populate the UI fields (Figma File URL, Slack Channel ID) and notification toggles.
*   **Connection Definition:**
    *   An input field for the **Figma File URL** to be monitored.
    *   An input field for the target **Slack Channel ID** (e.g., `C024BE91L`).
    *   **Scope:** The system manages one connection. Saving new details will overwrite the existing configuration.
*   **Notification Toggles:**
    *   A section with on/off toggles for each supported event type.
*   **Management Actions and Webhook Handling:**
    *   A **"Save Configuration"** button that intelligently creates, updates, or repairs the connection.
    *   A **"Send Test Message"** button to verify the Slack integration.
    *   A **Webhook Status Indicator** that makes a live API call on page load to display the webhook's real status (e.g., "Active ✅" or "Disabled ❌").
*   **Error Handling & User Feedback:**
    *   The UI must provide clear feedback for all actions using non-intrusive notifications (e.g., toasts).
    *   The backend will return structured error messages that the UI will display to the user.
    *   **Example Error Messages:**
        *   On Save Fail (Figma): `Error: Could not create webhook. The Figma token in your Environment Variables may be invalid or lack permissions.`
        *   On Save Fail (Figma URL): `Error: Could not create webhook. Please check the Figma File URL; it may be incorrect or inaccessible.`
        *   On Test Fail (Slack): `Error: Test message failed. Check the Slack token in Environment Variables and the Channel ID.`

**5.2. Notification Engine (The Backend Logic)**

**5.2.1. Core Notifications (MVP)**

*   **Library Publish**
*   **File Version Update** (for branch merges)
*   **New Comment**

**5.2.2. Stretch Goal**

*   **File Deletion**

**6. Technical Requirements & Recommendations**

**6.1. Architecture & Storage Strategy**

*   **Framework:** **Next.js**.
*   **Hosting:** **Vercel**.
*   **Secret Storage:** **Vercel Environment Variables**. This is the **required** location for storing the `FIGMA_PAT` and `SLACK_BOT_TOKEN` to ensure they are secure and separated from configuration.
*   **Configuration Storage:** **Vercel KV**. Required for storing non-secret, user-managed settings (Figma File URL, Slack Channel ID, notification toggle states) that are dynamically read from and written to by the UI.

**6.2. Authentication Method**

*   The application authenticates its API calls by using the secrets stored in the Vercel Environment Variables. These tokens are accessed exclusively on the server-side (`process.env.FIGMA_PAT`, etc.) and are never exposed to the client.

**6.3. API and Security**

*   **Figma API:** The tool will interact with the `/v2/webhooks` endpoint.
*   **Slack API:** The tool will use the `chat.postMessage` method with **Block Kit** formatting.
*   **Webhook Security:** The webhook listener endpoint **must** verify the `X-Figma-Signature` header on all incoming requests to ensure they are authentic requests from Figma.