import type { WritingError, LanguageToolResponse } from '../types/writingChecker';
import { checkLocalMechanics } from '../utils/localGrammarRules';

// Using the public LanguageTool API (has rate limits, consider self-hosting for production)
const LANGUAGETOOL_API = 'https://api.languagetool.org/v2/check';

/**
 * Check text for grammar, spelling, and style errors using LanguageTool API
 */
export async function checkText(text: string, language: string = 'en-US'): Promise<WritingError[]> {
  if (!text.trim()) {
    return [];
  }

  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', language);
    formData.append('enabledOnly', 'false');
    formData.append('level', 'picky'); // Enable stricter checking

    const response = await fetch(LANGUAGETOOL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API returned ${response.status}`);
    }

    const data: LanguageToolResponse = await response.json();
    
    // Parse API errors
    const apiErrors = parseLanguageToolResponse(data);
    
    // Run local checks
    const localErrors = checkLocalMechanics(text);
    
    // Merge them (could add de-duplication logic if needed, but simplistic merge usually works for distinct rules)
    // We prioritize local errors for basics if they overlap visually, but usually they cover different things
    return [...localErrors, ...apiErrors].sort((a, b) => a.offset - b.offset);
  } catch (error) {
    console.error('Error checking text with LanguageTool:', error);
    // Fallback to just local errors if API fails
    return checkLocalMechanics(text);
  }
}

/**
 * Parse LanguageTool API response into our WritingError format
 */
function parseLanguageToolResponse(response: LanguageToolResponse): WritingError[] {
  return response.matches.map((match, index) => {
    const category = categorizeError(match.rule.category.id, match.rule.id);
    const severity = categorizeSeverity(match.type.typeName);

    return {
      id: `${match.rule.id}-${match.offset}-${index}`,
      message: match.message,
      shortMessage: match.shortMessage || match.message,
      offset: match.offset,
      length: match.length,
      replacements: match.replacements.map(r => r.value).slice(0, 5), // Limit to 5 suggestions
      category,
      severity,
      rule: match.rule.id,
      context: match.context,
    };
  });
}

/**
 * Categorize error type based on LanguageTool category
 */
function categorizeError(categoryId: string, ruleId: string): WritingError['category'] {
  const upperCategoryId = categoryId.toUpperCase();
  const upperRuleId = ruleId.toUpperCase();
  
  if (upperCategoryId.includes('TYPO') || upperCategoryId.includes('MISSPELLING')) {
    return 'SPELLING';
  } else if (upperCategoryId.includes('GRAMMAR') || upperRuleId.includes('AGREEMENT') || upperRuleId.includes('VERB')) {
    return 'GRAMMAR';
  } else if (upperCategoryId.includes('STYLE') || upperCategoryId.includes('REDUNDANCY') || upperCategoryId.includes('CLARITY')) {
    return 'STYLE';
  } else if (upperCategoryId.includes('PUNCT') || upperCategoryId.includes('TYPOGRAPHY')) {
    return 'PUNCTUATION';
  } else if (upperCategoryId.includes('CASING')) {
    return 'TYPO';
  }
  
  return 'GRAMMAR'; // Default
}

/**
 * Categorize severity based on error type
 */
function categorizeSeverity(typeName: string): WritingError['severity'] {
  const upperTypeName = typeName.toUpperCase();
  
  if (upperTypeName.includes('HINT') || upperTypeName.includes('STYLE')) {
    return 'info';
  } else if (upperTypeName.includes('WARNING')) {
    return 'warning';
  } else {
    return 'error';
  }
}

/**
 * Helper to get category color for UI
 */
export function getCategoryColor(category: WritingError['category']): string {
  switch (category) {
    case 'SPELLING':
      return 'text-red-600 dark:text-red-400';
    case 'GRAMMAR':
      return 'text-blue-600 dark:text-blue-400';
    case 'STYLE':
      return 'text-green-600 dark:text-green-400';
    case 'PUNCTUATION':
      return 'text-purple-600 dark:text-purple-400';
    case 'TYPO':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Helper to get severity icon
 */
export function getSeverityIcon(severity: WritingError['severity']): string {
  switch (severity) {
    case 'error':
      return '🔴';
    case 'warning':
      return '🟡';
    case 'info':
      return '🔵';
    default:
      return '⚪';
  }
}
