# Ernos Labs deployment and rollback

## Preserved baseline

- Annotated tag: `pre-site-v2-2026-07-29-49d7b85`
- Exact commit: `49d7b85d696b8ce2e1522de56859cd2b0655de66`
- Meaning: the last production source state before the complete site-v2 rebuild

The tag must be pushed with the v2 release. The rollback workflow independently
checks the resolved commit before it packages or deploys anything.

## First v2 release

Production currently uses GitHub Pages' legacy `main`-branch builder. Before
pushing the v2 commit to `main`, switch the Pages build type to GitHub Actions.
Doing this first prevents the legacy builder from briefly publishing the raw
repository before the validated workflow finishes.

The release order is:

1. Confirm the local build, clean-SFT simulation and preview have passed.
2. Push the annotated rollback tag.
3. Switch Pages from the legacy branch builder to GitHub Actions.
4. Push the approved v2 commit to `main`.
5. Wait for **Build and deploy Ernos Labs** to complete successfully.
6. Verify `https://ernoslabs.com/`, the core routes, TTS/community service health,
   the published SFT revision and the mobile navigation before declaring the
   release complete.

The normal deployment workflow checks out a clean SFT revision, regenerates and
validates the public science snapshot, packages only public files and deploys
that artifact. Its scheduled run repeats the same process every six hours so a
new clean SFT commit can update the public model without a website code change.

## Exact rollback

In GitHub Actions, run **Roll back Ernos Labs to the preserved site** and enter
`ROLLBACK` when prompted. The workflow checks out the fixed annotated tag,
verifies the full commit hash, packages that preserved public site without an
SFT refresh and deploys it through the same Pages environment.

This restores the pre-v2 site without force-pushing or deleting the v2 history.
The v2 site can later be redeployed by running **Build and deploy Ernos Labs**
from `main`.
