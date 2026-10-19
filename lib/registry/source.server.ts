import fs from "fs";
import path from "path";
import { REGISTRY } from "./index";

export function getComponentSourceCode(slug: string): string {
  const item = REGISTRY.find((entry) => entry.slug === slug);
  if (!item) return "// Component not found";

  try {
    const fullPath = path.join(process.cwd(), item.filePath);
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return `// Error reading ${item.filePath}`;
  }
}