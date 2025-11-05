# Creating App Icons for PWA

## Quick Method (Recommended)

1. Open `frontend/public/generate-icons.html` in your browser
2. Click "Generate All Icons" (they generate automatically)
3. Click "Download" for each icon size
4. Save all icons to `frontend/public/` folder with these exact names:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

## Alternative Method - Using Online Tools

You can also use online PWA icon generators:
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 image of your app logo
3. Generate all sizes
4. Download and place in `frontend/public/` folder

## Using Your Own Logo

If you have your own logo/icon:
1. Create a 512x512 PNG image with transparent or solid background
2. Use an online tool or the generate-icons.html script
3. Replace the generated icons with your custom ones

## Icon Requirements

- Format: PNG
- Sizes: 72, 96, 128, 144, 152, 192, 384, 512 pixels
- Aspect Ratio: 1:1 (square)
- Recommended: Transparent or gradient background matching app theme

## After Creating Icons

Once icons are in place:
1. Rebuild the frontend: `npm run build` (in frontend folder)
2. The app will be installable as PWA
3. Users can "Add to Home Screen" on mobile devices

