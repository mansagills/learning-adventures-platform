/**
 * Accessibility Validator Agent
 * Validates games for WCAG 2.1 AA compliance using the accessibility-validator skill
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentResult,
  AccessibilityValidatorResponse,
  AccessibilityReport,
  AccessibilityIssue,
  GameFile,
  ValidationResult,
} from './types';

export class AccessibilityValidatorAgent extends BaseAgent {
  constructor() {
    super({
      type: 'accessibility-validator',
      skillPaths: ['skills/accessibility-validator/SKILL.md'],
      maxRetries: 1,
      timeout: 120000, // 2 minutes
      validateOutput: true,
    });
  }

  /**
   * Execute accessibility validation task
   */
  async execute(input: { game: GameFile } | { code: string; format: 'html' | 'react' }): Promise<AgentResult> {
    try {
      // Load skills
      await this.loadSkills();

      let code: string;
      let format: 'html' | 'react';

      // Handle two input types
      if ('game' in input) {
        code = input.game.code;
        format = input.game.format;
      } else {
        code = input.code;
        format = input.format;
      }

      // Run validation checks
      const issues = await this.validateAccessibility(code, format);

      // Calculate score
      const score = this.calculateAccessibilityScore(issues);

      // Generate recommendations
      const recommendations = this.generateRecommendations(issues);

      // Create report
      const report: AccessibilityReport = {
        overallScore: score,
        wcagCompliant: score >= 95,
        issues,
        recommendations,
        testedAt: new Date(),
      };

      const response: AccessibilityValidatorResponse = {
        report,
        passedValidation: score >= 95,
        criticalIssuesCount: issues.filter(i => i.severity === 'critical').length,
        recommendedFixes: recommendations,
      };

      return {
        success: true,
        output: response,
        errors: [],
        warnings: score < 95 ? ['Accessibility score below threshold (95%)'] : [],
        metadata: {
          duration: 0,
          timestamp: new Date(),
          version: '1.0.0',
        },
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        errors: [(error as Error).message],
        warnings: [],
        metadata: {
          duration: 0,
          timestamp: new Date(),
          version: '1.0.0',
        },
      };
    }
  }

  /**
   * Validate accessibility of code
   */
  private async validateAccessibility(code: string, format: 'html' | 'react'): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Check 1: Semantic HTML
    issues.push(...this.checkSemanticHTML(code));

    // Check 2: ARIA attributes
    issues.push(...this.checkARIA(code));

    // Check 3: Keyboard navigation
    issues.push(...this.checkKeyboardNavigation(code));

    // Check 4: Alt text for images
    issues.push(...this.checkAltText(code));

    // Check 5: Color contrast (basic check)
    issues.push(...this.checkColorContrast(code));

    // Check 6: Form labels
    issues.push(...this.checkFormLabels(code));

    // Check 7: Heading hierarchy
    issues.push(...this.checkHeadingHierarchy(code));

    // Check 8: Language attribute
    issues.push(...this.checkLanguage(code));

    // Format-specific checks
    if (format === 'react') {
      issues.push(...this.checkReactAccessibility(code));
    }

    return issues;
  }

  /**
   * Check for semantic HTML usage
   */
  private checkSemanticHTML(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for main landmark
    if (!code.includes('role="main"') && !code.includes('<main')) {
      issues.push({
        severity: 'high',
        category: 'Semantic HTML',
        description: 'Missing main landmark',
        suggestedFix: 'Add <main> element or role="main" to primary content area',
        wcagCriterion: 'WCAG 2.1 - 1.3.1 Info and Relationships',
      });
    }

    // Check for navigation
    if (code.includes('nav') && !code.includes('role="navigation"') && !code.includes('<nav')) {
      issues.push({
        severity: 'medium',
        category: 'Semantic HTML',
        description: 'Navigation not properly marked',
        suggestedFix: 'Use <nav> element for navigation sections',
        wcagCriterion: 'WCAG 2.1 - 1.3.1 Info and Relationships',
      });
    }

    return issues;
  }

  /**
   * Check ARIA attributes
   */
  private checkARIA(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for aria-label on interactive elements without text
    const buttonRegex = /<button[^>]*>/g;
    const buttons = code.match(buttonRegex) || [];

    for (const button of buttons) {
      if (!button.includes('aria-label') && !button.includes('>')) {
        issues.push({
          severity: 'high',
          category: 'ARIA',
          description: 'Button without accessible name',
          element: button.substring(0, 50),
          suggestedFix: 'Add aria-label attribute or visible text content to button',
          wcagCriterion: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
        });
      }
    }

    // Check for aria-live regions for dynamic content
    if (code.includes('score') || code.includes('timer')) {
      if (!code.includes('aria-live')) {
        issues.push({
          severity: 'medium',
          category: 'ARIA',
          description: 'Dynamic content without screen reader announcements',
          suggestedFix: 'Add aria-live="polite" to score/timer elements for screen reader updates',
          wcagCriterion: 'WCAG 2.1 - 4.1.3 Status Messages',
        });
      }
    }

    return issues;
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for keyboard event handlers
    if (code.includes('onClick') && !code.includes('onKeyDown') && !code.includes('onKeyPress')) {
      issues.push({
        severity: 'critical',
        category: 'Keyboard Navigation',
        description: 'Interactive elements not keyboard accessible',
        suggestedFix: 'Add keyboard event handlers (onKeyDown/onKeyPress) to all interactive elements',
        wcagCriterion: 'WCAG 2.1 - 2.1.1 Keyboard',
      });
    }

    // Check for tabindex usage
    if (code.includes('tabindex') && code.includes('tabindex="-1"')) {
      issues.push({
        severity: 'medium',
        category: 'Keyboard Navigation',
        description: 'Elements removed from tab order',
        suggestedFix: 'Avoid using tabindex="-1" unless specifically needed for focus management',
        wcagCriterion: 'WCAG 2.1 - 2.4.3 Focus Order',
      });
    }

    // Check for skip navigation
    if (code.length > 5000 && !code.includes('skip')) {
      issues.push({
        severity: 'medium',
        category: 'Keyboard Navigation',
        description: 'Missing skip navigation link',
        suggestedFix: 'Add skip navigation link for keyboard users to bypass repeated content',
        wcagCriterion: 'WCAG 2.1 - 2.4.1 Bypass Blocks',
      });
    }

    return issues;
  }

  /**
   * Check alt text for images
   */
  private checkAltText(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for images without alt text
    const imgRegex = /<img[^>]*>/g;
    const images = code.match(imgRegex) || [];

    for (const img of images) {
      if (!img.includes('alt=')) {
        issues.push({
          severity: 'critical',
          category: 'Images',
          description: 'Image missing alt attribute',
          element: img.substring(0, 50),
          suggestedFix: 'Add alt attribute to all images (use empty string for decorative images)',
          wcagCriterion: 'WCAG 2.1 - 1.1.1 Non-text Content',
        });
      }
    }

    return issues;
  }

  /**
   * Check color contrast
   */
  private checkColorContrast(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Basic check for common low-contrast combinations
    const lowContrastPatterns = [
      { pattern: /color:\s*#[a-fA-F0-9]{3,6}[^;]*gray/i, message: 'Possible low contrast: gray on gray' },
      { pattern: /background:\s*white[^;]*color:\s*#[fF]{3,6}/i, message: 'Possible low contrast: light text on white' },
    ];

    for (const { pattern, message } of lowContrastPatterns) {
      if (pattern.test(code)) {
        issues.push({
          severity: 'high',
          category: 'Color Contrast',
          description: message,
          suggestedFix: 'Ensure color contrast ratio is at least 4.5:1 for normal text and 3:1 for large text',
          wcagCriterion: 'WCAG 2.1 - 1.4.3 Contrast (Minimum)',
        });
      }
    }

    return issues;
  }

  /**
   * Check form labels
   */
  private checkFormLabels(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for inputs without labels
    const inputRegex = /<input[^>]*>/g;
    const inputs = code.match(inputRegex) || [];

    for (const input of inputs) {
      if (!input.includes('aria-label') && !code.includes(`<label`)) {
        issues.push({
          severity: 'critical',
          category: 'Forms',
          description: 'Form input without label',
          element: input.substring(0, 50),
          suggestedFix: 'Add <label> element or aria-label attribute to form inputs',
          wcagCriterion: 'WCAG 2.1 - 3.3.2 Labels or Instructions',
        });
      }
    }

    return issues;
  }

  /**
   * Check heading hierarchy
   */
  private checkHeadingHierarchy(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Extract heading levels
    const headingRegex = /<h([1-6])[^>]*>/g;
    const headings = [...code.matchAll(headingRegex)].map(match => parseInt(match[1]));

    if (headings.length > 0) {
      // Check if starts with h1
      if (headings[0] !== 1) {
        issues.push({
          severity: 'medium',
          category: 'Heading Hierarchy',
          description: 'Heading hierarchy does not start with h1',
          suggestedFix: 'Start heading hierarchy with <h1> for the main title',
          wcagCriterion: 'WCAG 2.1 - 1.3.1 Info and Relationships',
        });
      }

      // Check for skipped levels
      for (let i = 1; i < headings.length; i++) {
        if (headings[i] - headings[i - 1] > 1) {
          issues.push({
            severity: 'medium',
            category: 'Heading Hierarchy',
            description: 'Heading hierarchy skips levels',
            suggestedFix: 'Do not skip heading levels (e.g., h1 -> h3)',
            wcagCriterion: 'WCAG 2.1 - 1.3.1 Info and Relationships',
          });
          break;
        }
      }
    }

    return issues;
  }

  /**
   * Check language attribute
   */
  private checkLanguage(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (code.includes('<html') && !code.includes('lang=')) {
      issues.push({
        severity: 'high',
        category: 'Language',
        description: 'HTML element missing lang attribute',
        suggestedFix: 'Add lang="en" to <html> element',
        wcagCriterion: 'WCAG 2.1 - 3.1.1 Language of Page',
      });
    }

    return issues;
  }

  /**
   * React-specific accessibility checks
   */
  private checkReactAccessibility(code: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for onClick without onKeyDown in React
    if (code.includes('onClick=') && !code.includes('onKeyDown=')) {
      issues.push({
        severity: 'high',
        category: 'React Accessibility',
        description: 'onClick handler without keyboard equivalent',
        suggestedFix: 'Add onKeyDown handler to all elements with onClick',
        wcagCriterion: 'WCAG 2.1 - 2.1.1 Keyboard',
      });
    }

    // Check for fragments with key prop
    if (code.includes('<>') && code.includes('map(')) {
      issues.push({
        severity: 'low',
        category: 'React Accessibility',
        description: 'Consider using Fragment with key for lists',
        suggestedFix: 'Use <Fragment key={...}> for list items',
        wcagCriterion: 'Best Practice',
      });
    }

    return issues;
  }

  /**
   * Calculate overall accessibility score
   */
  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];

    // Group by severity
    const critical = issues.filter(i => i.severity === 'critical');
    const high = issues.filter(i => i.severity === 'high');

    if (critical.length > 0) {
      recommendations.push(`Fix ${critical.length} critical accessibility issue(s) immediately`);
      critical.forEach(issue => {
        recommendations.push(`- ${issue.description}: ${issue.suggestedFix}`);
      });
    }

    if (high.length > 0) {
      recommendations.push(`Address ${high.length} high-priority accessibility issue(s)`);
    }

    // General recommendations
    if (issues.length === 0) {
      recommendations.push('Great job! No accessibility issues detected');
    } else {
      recommendations.push('Test with screen readers (NVDA, JAWS, VoiceOver)');
      recommendations.push('Verify keyboard navigation flow');
      recommendations.push('Use automated tools like axe DevTools for additional checks');
    }

    return recommendations;
  }

  /**
   * Validate agent output
   */
  protected validate(output: any): ValidationResult {
    const response = output as AccessibilityValidatorResponse;

    if (!response.report) {
      return {
        valid: false,
        errors: ['No accessibility report generated'],
        warnings: [],
      };
    }

    if (typeof response.report.overallScore !== 'number') {
      return {
        valid: false,
        errors: ['Invalid accessibility score'],
        warnings: [],
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: [],
      score: response.report.overallScore,
    };
  }
}
