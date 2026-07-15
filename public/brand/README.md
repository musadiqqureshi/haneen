# Brand assets

Drop the real Haneen Grace raster assets here and they will be picked up automatically:

| File | Used for | Recommended size |
| --- | --- | --- |
| `logo.png` | Full horizontal logo (transparent PNG, champagne gold) | ~1200×400 |
| `logo-icon.png` | HG monogram only (transparent) | 512×512 |
| `banner.jpg` | Homepage hero banner (Season End Sale artwork) | ≥2000×1100 |

Until these exist, the site renders the inline-SVG monogram + wordmark from
`src/components/brand/logo.tsx`, so nothing breaks.

To use the real logo image in the header, replace `<Logo />` with:

```tsx
import Image from "next/image";
<Image src="/brand/logo.png" alt="Haneen Grace" width={220} height={72} priority />
```
