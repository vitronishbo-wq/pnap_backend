import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const IGNORE_FILES = new Set([
  "node_modules",
  ".git",
  "dist",
  "scripts",
  "docs/tree.json",
  "docs/tree.md",
  "docs/modules/tree.modules.json",
  "docs/modules/tree.modules.txt"
]);

const IGNORE_PATTERNS = [
  /^\.DS_Store$/i,
  /^thumbs\.db$/i,
  /^desktop\.ini$/i,
  /^\.env\.local$/i,
  /^\.env\.save.*$/i,
  /^.*\~$/,
  /^#.*#$/,
  /^.*\.swp$/i,
  /^.*\.tmp$/i,
  /^.*\.temp$/i,
  /^.*\.log$/i,
  /^.*\.bak$/i,
  /^.*\.orig$/i,
  /^.*\.rej$/i,
  /^\.vscode$/i,
  /^\.idea$/i,
  /^\.cache$/i,
  /^\.history$/i,
  /^\.pytest_cache$/i,
  /^__pycache__$/i,
  /^\.parcel-cache$/i,
  /^\.next$/i,
  /^\.nuxt$/i,
  /^\.serverless$/i,
  /^\.vercel$/i,
  /^\.firebase$/i,
  /^\.expo$/i,
  /^\.turbo$/i,
  /^\.parcel$/i,
  /^target$/i,
  /^out$/i,
  /^build$/i,
  /^public$/i
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalize(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function shouldIgnore(relativePath) {
  if (IGNORE_FILES.has(relativePath)) {
    return true;
  }

  const base = path.basename(relativePath);
  if (IGNORE_PATTERNS.some((pattern) => pattern.test(base))) {
    return true;
  }

  if (relativePath.split("/").some((segment) => IGNORE_PATTERNS.some((pattern) => pattern.test(segment)))) {
    return true;
  }

  return false;
}

async function crawlDirectory(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const result = {};

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = normalize(fullPath);

    if (shouldIgnore(relativePath)) {
      continue;
    }

    if (item.isDirectory()) {
      result[item.name] = await crawlDirectory(fullPath);
    } else {
      result[item.name] = null;
    }
  }

  return result;
}

function buildMarkdownTree(node, indent = "") {
  const entries = Object.entries(node);
  if (!entries.length) {
    return "";
  }

  return entries
    .map(([name, value]) => {
      if (value === null) {
        return `${indent}- ${name}`;
      }
      return `${indent}- ${name}\n${buildMarkdownTree(value, indent + "  ")}`;
    })
    .join("\n");
}

async function collectPaths(dir, filter) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const paths = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = normalize(fullPath);

    if (shouldIgnore(relativePath)) {
      continue;
    }

    if (item.isDirectory()) {
      paths.push(...await collectPaths(fullPath, filter));
    } else if (!filter || filter(relativePath)) {
      paths.push(relativePath);
    }
  }

  return paths.sort();
}

async function main() {
  const structure = await crawlDirectory(ROOT);
  const treeJson = {
    root: ROOT,
    structure,
  };

  const docsDir = path.join(ROOT, "docs");
  const modulesDir = path.join(docsDir, "modules");
  await fs.mkdir(modulesDir, { recursive: true });

  const treeJsonPath = path.join(docsDir, "tree.json");
  const treeMdPath = path.join(docsDir, "tree.md");
  const treeModulesJsonPath = path.join(modulesDir, "tree.modules.json");
  const treeModulesTxtPath = path.join(modulesDir, "tree.modules.txt");

  await fs.writeFile(treeJsonPath, JSON.stringify(treeJson, null, 2));

  const markdown = `# Projeto ${path.basename(ROOT)}\n\n${buildMarkdownTree(structure)}`;
  await fs.writeFile(treeMdPath, markdown);

  const backendPaths = await collectPaths(ROOT, (p) => p.startsWith("server") || p === "server.ts");
  const frontendPaths = await collectPaths(ROOT, (p) => p.startsWith("src") || p.startsWith("assets"));
  const databasePaths = await collectPaths(ROOT, (p) => p.startsWith("prisma"));
  const configPaths = [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "docker-compose.yml",
    "README.md",
    "metadata.json",
    ".env",
    ".env.example",
    "AGENT_RULES.md"
  ].filter((p) => fs.access(path.join(ROOT, p)).then(() => true).catch(() => false));

  const resolvedConfigPaths = [];
  for (const candidate of configPaths) {
    if (await exists(path.join(ROOT, candidate))) {
      resolvedConfigPaths.push(candidate);
    }
  }

  const modulesJson = {
    backend: {
      description: "Express API, authentication, RBAC, and backoffice endpoints.",
      paths: backendPaths,
    },
    frontend: {
      description: "Vite + React SPA UI components and client-side flows.",
      paths: frontendPaths,
    },
    database: {
      description: "Prisma schema and seed data for the penitentiary domain.",
      paths: databasePaths,
    },
    configuration: {
      description: "Project configuration, environment, metadata, and build settings.",
      paths: resolvedConfigPaths,
    },
  };

  await fs.writeFile(treeModulesJsonPath, JSON.stringify(modulesJson, null, 2));

  const modulesTxt = Object.entries(modulesJson)
    .map(([name, module]) => {
      const header = `# ${name}`;
      const list = module.paths.map((p) => `- ${p}`).join("\n");
      return `${header}\n${module.description}\n${list}`;
    })
    .join("\n\n");

  await fs.writeFile(treeModulesTxtPath, modulesTxt);

  console.log("[update-indexes] Generated:");
  console.log(` - ${path.relative(ROOT, treeJsonPath)}`);
  console.log(` - ${path.relative(ROOT, treeMdPath)}`);
  console.log(` - ${path.relative(ROOT, treeModulesJsonPath)}`);
  console.log(` - ${path.relative(ROOT, treeModulesTxtPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
