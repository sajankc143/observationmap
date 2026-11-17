# observationmap

Source for the interactive butterfly observation maps and species pages on [butterflyexplorers.com](https://butterflyexplorers.com), a butterfly observation database maintained by Sajan KC and Anisha Sapkota.

The site documents butterfly observations across the Americas and beyond. Together, the authors have recorded more than 1,500 butterfly species over six years of fieldwork and photography.

## What this repository does

- Builds a machine-readable observation dataset (`observations.json`) from the observation records.
- Updates that dataset automatically with a scheduled GitHub Actions workflow, so the maps and species pages stay current without manual rebuilding.
- Draws the observations on interactive Leaflet maps (`newmap.js`) so each species' distribution can be explored by locality.
- Keeps taxonomy consistent: a butterfly taxonomy file, a species authority file, and a synonym system handle name changes and current valid names.
- Publishes the result as static pages through GitHub Pages.

## Contents

| File | Purpose |
| --- | --- |
| `observations.json` | Observation records used by the maps and species pages |
| `parse-observations.js` | Parses source observation records into `observations.json` |
| `newmap.js` | Interactive Leaflet map of observation localities |
| `butterfly-taxonomy.json` | Taxonomic hierarchy used to organize species |
| `species-authors.json` | Taxonomic authorities for species names |
| `comparison-data.json` | Data for comparing species and records |
| `new-butterflies*.html` | Species gallery pages |
| `.github/workflows/` | GitHub Actions workflow that refreshes the data |

## Data notes

- Records for giant skippers (Lepidoptera: Hesperiidae: Megathymina) use obscured coordinates to protect sensitive populations. Locality names are accurate.
- Distribution data and species images are shared under a CC BY-NC license.

## Use and contact

Questions or corrections: sajankc143@gmail.com

Maintained by Sajan KC, PhD student, Department of Entomology and Nematology, University of Florida.
