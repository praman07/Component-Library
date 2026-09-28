import fs from 'fs';
import path from 'path';

export interface InstallOptions {
  componentSlug: string;
  targetDir?: string;
  serverUrl?: string;
  authToken?: string;
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface InstallResult {
  success: boolean;
  componentSlug: string;
  filesWritten: string[];
  dependencies: Record<string, string>;
  message: string;
  error?: string;
}

/**
 * Validates path security to prevent arbitrary file overwrite or directory traversal.
 * Rejects absolute paths outside the target, paths containing '..', and hidden escapes.
 */
export function validateSafePath(relativePath: string, targetBaseDir: string): string {
  // Reject absolute paths
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe absolute path detected: "${relativePath}". Paths must be project-relative.`);
  }

  // Reject path traversal characters
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || normalized.includes(path.sep + '..' + path.sep)) {
    throw new Error(`Unsafe path traversal detected: "${relativePath}". Access outside project boundary is prohibited.`);
  }

  const resolved = path.resolve(targetBaseDir, normalized);
  const resolvedTarget = path.resolve(targetBaseDir);

  if (!resolved.startsWith(resolvedTarget + path.sep) && resolved !== resolvedTarget) {
    throw new Error(`Resolved path "${resolved}" escapes root directory "${resolvedTarget}".`);
  }

  return resolved;
}

/**
 * Core installation function:
 * 1. Takes component bundle data
 * 2. Validates every destination file path
 * 3. Checks if any file exists (refuses overwrite unless overwrite=true)
 * 4. Writes files to project directory
 */
export function executeInstallation(
  bundle: {
    slug: string;
    files: Array<{ path: string; content: string }>;
    dependencies: Record<string, string>;
  },
  options: {
    targetDir: string;
    overwrite?: boolean;
    dryRun?: boolean;
  }
): InstallResult {
  const targetDir = path.resolve(options.targetDir);
  const writtenFiles: string[] = [];

  // Step 1: Validate all file paths and check for overwrite collision BEFORE writing any file
  for (const file of bundle.files) {
    const fullPath = validateSafePath(file.path, targetDir);

    if (fs.existsSync(fullPath) && !options.overwrite) {
      throw new Error(
        `File already exists: "${file.path}". Installation aborted to prevent silent overwrite. Pass --overwrite flag to replace existing file.`
      );
    }
  }

  // Step 2: Write files if not dry run
  if (!options.dryRun) {
    for (const file of bundle.files) {
      const fullPath = validateSafePath(file.path, targetDir);
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, file.content, 'utf-8');
      writtenFiles.push(file.path);
    }
  }

  return {
    success: true,
    componentSlug: bundle.slug,
    filesWritten: writtenFiles,
    dependencies: bundle.dependencies,
    message: `Installed ${bundle.slug} (${bundle.files.length} files) into ${targetDir}`,
  };
}
