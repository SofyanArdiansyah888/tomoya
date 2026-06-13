import { execSync } from 'child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const frontendDir = join(root, 'frontend')
const distAssetsDir = join(frontendDir, 'dist', 'assets')
const backendAssetsDir = join(root, 'backend', 'public', 'assets')
const bladePath = join(root, 'backend', 'resources', 'views', 'welcome.blade.php')

const blade = readFileSync(bladePath, 'utf8')
const targetJs = blade.match(/src="\/assets\/([^"]+\.js)"/)?.[1]
const targetCss = blade.match(/href="\/assets\/([^"]+\.css)"/)?.[1]

if (!targetJs || !targetCss) {
  console.error('Could not find JS/CSS paths in welcome.blade.php')
  process.exit(1)
}

console.log('Building frontend...')
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' })

mkdirSync(backendAssetsDir, { recursive: true })

const assetFiles = readdirSync(distAssetsDir)
const builtJs = assetFiles.find((file) => file.endsWith('.js'))
const builtCss = assetFiles.find((file) => file.endsWith('.css'))

if (!builtJs || !builtCss) {
  console.error('Build output missing JS or CSS files in frontend/dist/assets')
  process.exit(1)
}

writeFileSync(
  join(backendAssetsDir, targetJs),
  readFileSync(join(distAssetsDir, builtJs))
)
writeFileSync(
  join(backendAssetsDir, targetCss),
  readFileSync(join(distAssetsDir, builtCss))
)

console.log(`Overwritten /assets/${targetJs}`)
console.log(`Overwritten /assets/${targetCss}`)
console.log('Done!')
