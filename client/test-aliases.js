// Test file to verify path aliases
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Test if we can resolve the @ alias
const testAlias = (alias, expectedPath) => {
  try {
    const resolved = require.resolve(alias, { paths: [__dirname] });
    console.log(`✅ ${alias} resolves to: ${resolved}`);
    return true;
  } catch (error) {
    console.error(`❌ ${alias} failed to resolve. Expected: ${expectedPath}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
};

// Test the @ alias
testAlias('@/lib/queryClient', 'client/src/lib/queryClient');

// Test a component
testAlias('@/components/ui/toaster', 'client/src/components/ui/toaster');

console.log('\nIf you see any ❌ above, there are issues with the path aliases.');
