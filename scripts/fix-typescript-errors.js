#!/usr/bin/env node

/**
 * This script automates fixing common TypeScript and ESLint issues in the codebase.
 * It directly modifies files to address common patterns like:
 * - Adding null checks for potentially undefined properties
 * - Fixing anonymous default exports
 * - Adding missing dependencies to useEffect hooks
 * - Adding type annotations for implicit 'any' parameters
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the root directory
const rootDir = path.resolve(__dirname, '..');

// Function to recursively find all TypeScript files
function findTsFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    
    if (fs.statSync(filepath).isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next') {
        filelist = findTsFiles(filepath, filelist);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  
  return filelist;
}

// Function to fix anonymous default exports
function fixAnonymousDefaultExports(file, content) {
  const anonymousExportRegex = /export default ({[^;]*}|function\s*\([^)]*\)[^;]*{[^}]*}|new [A-Za-z]+\([^)]*\))/g;
  
  let newContent = content;
  let match;
  
  // Only process the matches if they're directly after 'export default'
  if ((match = anonymousExportRegex.exec(content)) !== null) {
    const variableName = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9]/g, '_');
    newContent = content.replace(
      anonymousExportRegex,
      `const ${variableName} = $1;\n\nexport default ${variableName}`
    );
  }
  
  return newContent;
}

// Function to fix missing null checks
function fixMissingNullChecks(content) {
  const potentialNullAccessRegex = /(\w+)\.(\w+)\s*[\.\[](?!\s*\?\.)/g;
  let newContent = content;
  
  // Replace with optional chaining
  newContent = newContent.replace(potentialNullAccessRegex, (match, obj, prop) => {
    return `${obj}?.${prop}`;
  });
  
  return newContent;
}

// Function to fix useEffect dependency arrays
function fixUseEffectDependencies(content) {
  // This is a simplified approach and won't catch all cases
  const useEffectRegex = /useEffect\(\(\)\s*=>\s*{[^}]*}\s*,\s*\[(.*?)\]\)/g;
  let newContent = content;
  
  // Find variables used inside useEffect that are not in dependency array
  const variableUsageRegex = /useEffect\(\(\)\s*=>\s*{([^}]*)}\s*,\s*\[(.*?)\]\)/g;
  let match;
  
  while ((match = variableUsageRegex.exec(content)) !== null) {
    const effectBody = match[1];
    const dependencies = match[2].split(',').map(d => d.trim()).filter(d => d);
    
    // This regex will find variable usages, but it's not perfect
    const usedVarsRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*\(|:)/g;
    const usedVariables = new Set();
    let varMatch;
    
    while ((varMatch = usedVarsRegex.exec(effectBody)) !== null) {
      const varName = varMatch[1];
      // Exclude common keywords
      if (!['if', 'else', 'return', 'const', 'let', 'var', 'function', 'async', 'await'].includes(varName)) {
        usedVariables.add(varName);
      }
    }
    
    // Build a new dependency array with missing dependencies
    const newDependencies = [...dependencies];
    
    for (const variable of usedVariables) {
      if (!dependencies.includes(variable)) {
        newDependencies.push(variable);
      }
    }
    
    if (newDependencies.length > dependencies.length) {
      const newDependencyArray = newDependencies.join(', ');
      newContent = newContent.replace(match[0], `useEffect(() => {${effectBody}}, [${newDependencyArray}])`);
    }
  }
  
  return newContent;
}

// Function to fix implicit any parameters
function fixImplicitAnyParameters(content) {
  // Find arrow functions with implicit any parameters
  const arrowFuncRegex = /(\([^)]*\))\s*=>/g;
  let newContent = content;
  
  // Replace parameters with typed parameters
  newContent = newContent.replace(arrowFuncRegex, (match, params) => {
    // Skip if already has type annotations
    if (params.includes(':')) {
      return match;
    }
    
    // Add types to parameters
    return params.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, '$1: any') + ' =>';
  });
  
  return newContent;
}

// Main function to fix issues in a file
function fixIssuesInFile(file) {
  try {
    console.log(`Processing ${file}...`);
    
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    // Apply fixes
    newContent = fixAnonymousDefaultExports(file, newContent);
    newContent = fixMissingNullChecks(newContent);
    newContent = fixUseEffectDependencies(newContent);
    newContent = fixImplicitAnyParameters(newContent);
    
    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Fixed issues in ${file}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
    return false;
  }
}

// Main execution
try {
  console.log('Finding TypeScript files...');
  const files = findTsFiles(path.join(rootDir, 'app'));
  console.log(`Found ${files.length} TypeScript files.`);
  
  let fixedFiles = 0;
  
  // Process each file
  files.forEach(file => {
    if (fixIssuesInFile(file)) {
      fixedFiles++;
    }
  });
  
  console.log(`\nFixed issues in ${fixedFiles} files.`);
  console.log('\nRunning ESLint to fix formatting issues...');
  
  try {
    // Run ESLint with --fix to automatically fix simple issues
    execSync('npx eslint --ext .ts,.tsx app/ --fix', { stdio: 'inherit' });
  } catch (error) {
    console.log('ESLint completed with errors. Some issues may still need manual fixes.');
  }
  
  console.log('\nRunning TypeScript type-check to identify remaining issues...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
  } catch (error) {
    console.log('TypeScript check completed with errors. Some issues still need manual fixes.');
  }
  
  console.log('\nScript completed. Please review the changes and manually fix any remaining issues.');
} catch (error) {
  console.error('Error:', error);
} 