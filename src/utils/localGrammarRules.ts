import type { WritingError } from '../types/writingChecker';

// Helper: Check if word starts with vowel sound (very basic approximation)
const startsWithVowelSound = (word: string): boolean => {
  return /^[aeiou]/i.test(word) && !/^u[b-z]/.test(word); // Exclude 'uni...' approx
};

export const checkLocalMechanics = (text: string): WritingError[] => {
  const errors: WritingError[] = [];
  
  // 1. Check for sentence capitalization
  const sentences = text.split(/([.!?]\s+)/);
  let currentOffset = 0;

  sentences.forEach((segment) => {
    if (!segment.trim() || /^[.!?]\s+$/.test(segment)) {
      currentOffset += segment.length;
      return;
    }

    const trimmedStart = segment.trimStart();
    const leadingSpaces = segment.length - trimmedStart.length;
    
    if (trimmedStart.length > 0) {
      const firstChar = trimmedStart[0];
      if (firstChar >= 'a' && firstChar <= 'z') {
        errors.push({
          id: `local-cap-${currentOffset + leadingSpaces}`,
          message: "Sentences should start with a capital letter.",
          shortMessage: "Capitalize",
          offset: currentOffset + leadingSpaces,
          length: 1,
          replacements: [firstChar.toUpperCase()],
          category: 'TYPO',
          severity: 'error',
          rule: 'LOCAL_CAPITALIZATION',
          context: {
            text: segment,
            offset: leadingSpaces,
            length: 1
          }
        });
      }
    }
    currentOffset += segment.length;
  });

  let match; 

  // 2. Check for spaces before punctuation
  const spaceBeforePunctuation = /\s+([,.!?:;])/g;
  while ((match = spaceBeforePunctuation.exec(text)) !== null) {
    errors.push({
      id: `local-punct-space-${match.index}`,
      message: "Don't put a space before punctuation.",
      shortMessage: "Remove space",
      offset: match.index,
      length: match[0].length,
      replacements: [match[1]],
      category: 'PUNCTUATION',
      severity: 'warning',
      rule: 'LOCAL_SPACE_BEFORE_PUNCT',
      context: { text: match[0], offset: 0, length: match[0].length } // simplified context
    });
  }

  // 3. Check for double spaces
  const doubleSpaces = /[ ]{2,}/g;
  while ((match = doubleSpaces.exec(text)) !== null) {
      errors.push({
        id: `local-double-space-${match.index}`,
        message: "Avoid double spaces.",
        shortMessage: "Fix spacing",
        offset: match.index,
        length: match[0].length,
        replacements: [' '],
        category: 'TYPO',
        severity: 'info',
        rule: 'LOCAL_DOUBLE_SPACE',
        context: { text: match[0], offset: 0, length: match[0].length }
      });
  }
  
  // 4. Check for standalone lowercase 'i'
  const lowercaseI = /(?:^|\s)(i)(?:$|[^a-zA-Z])/g;
  while ((match = lowercaseI.exec(text)) !== null) {
      const startOfI = match.index + match[0].indexOf('i');
      errors.push({
          id: `local-lowercase-i-${startOfI}`,
          message: "Always capitalize 'I'.",
          shortMessage: "Capitalize",
          offset: startOfI,
          length: 1,
          replacements: ['I'],
          category: 'TYPO',
          severity: 'error',
          rule: 'LOCAL_LOWERCASE_I',
          context: { text: match[0], offset: match[0].indexOf('i'), length: 1 }
      });
  }

  // 5. A/An Confusion (Basic Heuristic)
  // 'a' followed by vowel sound
  const aWithVowel = /\b(a)\s+([aeio][a-z]+)\b/gi; 
  while ((match = aWithVowel.exec(text)) !== null) {
      if (!startsWithVowelSound(match[2])) continue; // Skip if regex false positive
      errors.push({
          id: `local-a-an-${match.index}`,
          message: `Use 'an' before '${match[2]}'.`,
          shortMessage: "Change to 'an'",
          offset: match.index,
          length: 1, // 'a'
          replacements: ['an'],
          category: 'GRAMMAR',
          severity: 'warning',
          rule: 'LOCAL_A_VS_AN',
           context: { text: match[0], offset: 0, length: 1 }
      });
  }

  // 'an' followed by consonant sound
  const anWithConsonant = /\b(an)\s+([bcdfghjklmnpqrstvwxyz][a-z]+)\b/gi;
  while ((match = anWithConsonant.exec(text)) !== null) {
      errors.push({
          id: `local-an-a-${match.index}`,
          message: `Use 'a' before '${match[2]}'.`,
          shortMessage: "Change to 'a'",
          offset: match.index,
          length: 2, // 'an'
          replacements: ['a'],
          category: 'GRAMMAR',
          severity: 'warning',
          rule: 'LOCAL_AN_VS_A',
           context: { text: match[0], offset: 0, length: 2 }
      });
  }

  // 6. Common Subject-Verb Agreement (Simple heuristic)
  const badSubjectVerb = [
      { regex: /\b(we|they|you|users|people)\s+(is|has|was)\b/gi, fix: (s: string) => s === 'was' ? 'were' : (s === 'has' ? 'have' : 'are') },
      { regex: /\b(he|she|it)\s+(have|are|were)\b/gi, fix: (s: string) => s === 'have' ? 'has' : (s === 'were' ? 'was' : 'is') },
      { regex: /\b(i)\s+(is|has|were)\b/gi, fix: (s: string) => s === 'has' ? 'have' : 'am' }
  ];

  badSubjectVerb.forEach((rule, idx) => {
      while ((match = rule.regex.exec(text)) !== null) {
          const subject = match[1];
          const verb = match[2];
          const correction = rule.fix(verb.toLowerCase());
          
           errors.push({
              id: `local-sv-${idx}-${match.index}`,
              message: `Incorrect verb agreement: '${subject} ${correction}'.`,
              shortMessage: `Change to '${correction}'`,
              offset: match.index + match[0].toLowerCase().lastIndexOf(verb.toLowerCase()),
              length: verb.length,
              replacements: [correction],
              category: 'GRAMMAR',
              severity: 'error',
              rule: 'LOCAL_SUBJECT_VERB',
              context: { text: match[0], offset: match[0].toLowerCase().lastIndexOf(verb.toLowerCase()), length: verb.length }
          });
      }
  });

  // 7. Double Negatives (Simple scan)
  const doubleNegatives = /\b(don't|doesn't|didn't|cannot|can't|won't)\s+(nothing|no\s+one|nobody|nowhere)\b/gi;
  while ((match = doubleNegatives.exec(text)) !== null) {
      errors.push({
          id: `local-double-neg-${match.index}`,
          message: "Double negative detected.",
          shortMessage: "Fix negative",
          offset: match.index,
          length: match[0].length,
          replacements: [match[0].replace(match[2], match[2] === 'nothing' ? 'anything' : 'any one')], // simplified fix suggestion
          category: 'GRAMMAR',
          severity: 'warning',
          rule: 'LOCAL_DOUBLE_NEGATIVE',
          context: { text: match[0], offset: 0, length: match[0].length }
      });
  }

  return errors;
};
