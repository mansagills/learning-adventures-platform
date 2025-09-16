export interface AnalyticsEvent {
  event: string;
  payload?: Record<string, any>;
}

export function track(event: string, payload?: Record<string, any>): void {
  // Analytics implementation stub
  if (typeof window !== 'undefined') {
    console.log('Analytics Event:', { event, payload });

    // Future implementation could integrate with:
    // - Google Analytics 4
    // - Mixpanel
    // - Segment
    // - Custom analytics service

    // Example GA4 integration:
    // gtag('event', event, payload);

    // Example custom service:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event, payload, timestamp: Date.now() })
    // });
  }
}

// Predefined event helpers
export const analytics = {
  clickCTA: (ctaName: string, location: string) =>
    track('cta_click', { cta_name: ctaName, location }),

  viewSection: (sectionName: string) =>
    track('section_view', { section_name: sectionName }),

  openFAQ: (question: string) =>
    track('faq_open', { question }),

  submitForm: (formName: string) =>
    track('form_submit', { form_name: formName }),

  clickPartnerLogo: (partnerName: string) =>
    track('partner_click', { partner_name: partnerName }),
};