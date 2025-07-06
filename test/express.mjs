import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import sass from 'sass';
import { build } from 'esbuild';

const app = express();
const port = 3145;

// Resolve __dirname (já que estamos usando ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a pasta pública
const publicDir = path.join(__dirname, './html');
const projectRoot = path.join(__dirname, '../');

/**
 * @typedef {(filePath: string, fileName: string, req: import('express').Request, res: import('express').Response, next?: import('express').NextFunction) => void} ReadFileUrl
 */

/**
 * @param {string} mimetype
 * @param {string[]} formats
 * @param {string} folder
 * @param {ReadFileUrl} [response]
 * @returns {import('express').Application}
 */
const readFileUrl =
  (
    mimetype,
    formats,
    folder = '',
    response = async (filePath, fileName, req, res) => res.sendFile(filePath),
  ) =>
  (req, res, next) =>
    new Promise((resolve, reject) => {
      const filePath = path.join(projectRoot, folder, req.params[0]);
      if (!filePath.startsWith(projectRoot)) {
        return res.status(403).send('Access denied: path is outside allowed root.');
      }

      let allowed = false;
      for (const format of formats) {
        if (filePath.endsWith(format)) {
          allowed = true;
          break;
        }
      }

      if (!allowed) return next();
      try {
        fs.accessSync(filePath, fs.constants.F_OK);
      } catch (err) {
        reject(err);
      } finally {
        res.type(mimetype);
        response(filePath, req.params[0], req, res, next).then(resolve).catch(reject);
      }
    });

/** @type {ReadFileUrl} */
const jsLoader = async (filePath, fileName, req, res) => {
  try {
    let code = await fs.promises.readFile(filePath, 'utf-8');

    for (const modName in importsToRemove) {
      const args = importsToRemove[modName];
      // Remove importações de Buffer (de qualquer tipo)
      code = code.replace(
        new RegExp(
          `import\\s*\\{${args.map((val, index) => `\\s*${val}${index !== args.length - 1 ? ',' : ''}\\s*`)}\\}\\s*from\\s*['"]${modName}['"]\\s*;?`,
          'g',
        ),
        '',
      );
    }

    // Envia com o tipo correto
    res.send(code);
  } catch (err) {
    console.error(err);
    res.status(500).send(`JS compilation error:\n${err.message}`);
  }
};

/** @type {ReadFileUrl} */
const mdLoader = async (filePath, fileName, req, res) => {
  try {
    const mdContent = await fs.promises.readFile(filePath, 'utf-8');
    const html = marked.parse(mdContent);

    // Envolve o HTML em um template básico
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            body {
              max-width: 800px;
              margin: 2rem auto;
              padding: 1rem;
              font-family: sans-serif;
              line-height: 1.6;
            }
            h1,h2,h3 { border-bottom: 1px solid #ccc; }
            code { background: #eee; padding: 2px 4px; border-radius: 4px; }
            pre code { display: block; padding: 1rem; background: #272822; color: #f8f8f2; overflow-x: auto; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
  } catch (err) {
    res.status(404).send(`Markdown file not found: ${fileName}`);
  }
};

/** @type {ReadFileUrl} */
const readScss = async (filePath, fileName, req, res) => {
  try {
    const result = sass.compile(filePath, {
      style: 'expanded',
      loadPaths: [path.dirname(filePath)],
    });
    res.send(result.css);
  } catch (err) {
    console.error(err);
    res.status(500).send(`SCSS compilation error:\n${err.message}`);
  }
};

// Middleware personalizado para .mjs
const sources = ['src', 'dist'];
const versions = ['legacy', 'v1'];
for (const src of sources) {
  for (const v of versions) {
    app.get(
      new RegExp(`^\\/${src}\\/${v}\\/(.*)$`),
      readFileUrl('application/javascript', ['.mjs', '.cjs', '.js'], `./${src}/${v}`, jsLoader),
    );
    app.get(
      new RegExp(`^\\/${src}\\/${v}\\/(.*)$`),
      readFileUrl('text/css', ['.css'], `./${src}/${v}`),
    );
    app.get(
      new RegExp(`^\\/${src}\\/${v}\\/(.*)$`),
      readFileUrl('text/css', ['.scss'], `./${src}/${v}/scss`, readScss),
    );
    app.get(
      new RegExp(`^\\/${src}\\/${v}\\/(.*)$`),
      readFileUrl('text/markdown', ['.md'], `./${src}/${v}`, mdLoader),
    );
  }
}

// Instalar modulos externos
/** @type {Record<string, string[]>} */
const importsToRemove = {
  buffer: ['Buffer'],
};

/** @type {(modName: string, globalName: string, globalResult: string) => import('express').Application} */
const installNodeModules = (modName, globalName, globalResult) => async (req, res, next) => {
  try {
    const result = await build({
      entryPoints: [modName],
      bundle: true,
      write: false,
      format: 'iife',
      globalName,
      platform: 'browser',
    });

    if (result.errors.length > 0) {
      for (const err of result.errors) console.error(err);
      throw new Error(`Failed to bundle ${modName}`);
    }

    if (result.warnings.length > 0) {
      for (const warn of result.warnings) console.warn(warn);
    }

    const js = result.outputFiles[0].text;
    const final = `
      // Polyfill: require('${modName}') e ${globalName} global
      (function () {
        ${js}
        ${globalResult}
      })();
    `;

    res.type('application/javascript');
    res.send(final);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Failed to bundle ${modName}`);
  }
};

// Serve buffer global para o navegador
app.get('/__buffer.js', installNodeModules('buffer', 'Buffer', 'window.Buffer = Buffer.Buffer;'));

// Middleware para servir arquivos estáticos
app.use(express.static(publicDir));

// Inicia o servidor
app.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
