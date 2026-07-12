# eluno-books - Transparent Distortions

## What is this project?

This is a collection of books that present the same core spiritual philosophy through different linguistic and cultural lenses. Each version adapts the language to be received without unnecessary resistance by its intended audience.

The source material is the [Ra Material (The Law of One)](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one), channeled by L/L Research between 1981 and 1984. These books are AI-assisted reinterpretations of that philosophy, written with the explicit purpose of making the teachings accessible to readers who might otherwise never encounter them.

## Why multiple versions of the same teaching?

There is a well-documented psychological phenomenon where certain words or concepts trigger automatic resistance in readers, preventing them from engaging with the actual content:

- **Cognitive dissonance** (Leon Festinger, 1957): The mental discomfort experienced when new information conflicts with existing beliefs. Research shows that exposure to religious or spiritual terminology alone can activate cognitive frameworks that block reception of unfamiliar ideas.

- **Psychological reactance** (Jack Brehm, 1966): The automatic resistance triggered when a person perceives their freedom of thought or belief system as being challenged. Specific words act as triggers: "reincarnation," "densities," or "channeling" may close a Christian reader; "God," "sin," or "redemption" may close an agnostic one.

- **Conscious shocks** (G.I. Gurdjieff, Fourth Way): Gurdjieff taught that humans live in "waking sleep" and require shocks to awaken. However, he also warned that shocks administered without preparation produce resistance rather than awakening.

Each book in this project removes the specific trigger words that would activate reactance in its target audience, while preserving the complete philosophical message. Nothing is added that isn't in the source. Content is only omitted - never distorted into falsehood.

This is not deception. It is the same compassionate principle used by every good teacher: meeting the student where they are.

## The Distortion Tree

```
000 (eluno) ─── The philosophical core
 │
 ├── 010 (todo) ─── Agnostic simplification
 │
 ├── 020 (jesus) ─── Christian lens
 │    │
 │    └── 021 (sanacion) ─── Practical healing sub-branch
 │
 └── 100 (doctrinas) ─── Theological doctrine branch
 │
 └── 110 (dormidos) ─── For the spiritually asleep
```

## Books in this repository

| ID | Package | Book Title | Distortion | Audience |
|----|---------|-----------|------------|----------|
| 010 | `todo` | Las Enseñanzas de la Ley del Uno | Agnostic/narrative | Modern seekers without religious framework |
| 020 | `jesus` | El Camino del Amor | Christian | Christians open to contemplative spirituality |
| 021 | `sanacion` | Sanación | Christian + practical | Christians seeking healing and transformation |
| 100 | `doctrinas` | Doctrinas | Theological | Traditional/Catholic Christians |
| 110 | `dormidos` | Dormidos | Secular/gentle | Those spiritually asleep |

The core philosophical book (000 - El Uno / The One) lives in a [separate repository](https://github.com/chuchurex/eluno).

### What remains constant across ALL versions:
1. Unity of consciousness at source
2. Apparent separation as sacred and necessary
3. Free will as fundamental principle
4. Love as the creative force
5. Every being is the Creator experiencing itself

### What changes:
- **Language register**: scientific → narrative → theological
- **Trigger words removed**: Each version omits terminology that would activate resistance in its audience
- **Frame of reference**: cosmology → personal experience → faith

## Transparency

The writing prompts and AI generation process for each book are available in this repository. Every distortion is documented and intentional. The reader of any version can trace back to the source material and verify that nothing has been falsified - only adapted.

This is what we call a **transparent distortion**: the philosophical equivalent of translating between languages, except the translation is between worldviews rather than vocabularies.

Each book has a `PROMPT.md` file that documents its voice, terminology, and target audience.

---

## Development

This is a pnpm monorepo (pnpm 10.15.1). Each book is an independent workspace under `packages/*`, and they all share `@eluno/core` as build tooling. Use pnpm, not npm.

### Installation
```bash
pnpm install
```

### Working on a book
Dev aliases from the repo root (`sass --watch` + `live-server` in parallel):
```bash
pnpm run dev:todo       # http://127.0.0.1:3002
pnpm run dev:sanacion   # http://127.0.0.1:3004
pnpm run dev:jesus      # http://127.0.0.1:3005
pnpm run dev:dormidos   # http://127.0.0.1:3006
pnpm run dev:doctrinas  # http://127.0.0.1:3007
```

For any single workspace directly:
```bash
pnpm --filter @eluno/<book> dev     # or build
```

### Build all books
```bash
pnpm run build:all     # sequential build of the 5 published books
```
`build:all` covers todo, jesus, sanacion, doctrinas and dormidos. The `raw` and `otramirada` workspaces are excluded.

### Audiobooks
Each book exposes TTS scripts (Edge TTS via `node-edge-tts`, free, no API key) run from its workspace:
```bash
pnpm run audio:extract    # extract chapter text for TTS
pnpm run audio:generate   # generate MP3s
pnpm run audio:assemble   # sync audio with text
pnpm run audio:concat     # concatenate chapters into the full book
pnpm run audio:tag        # write ID3 metadata
```

## Repository Structure

```
eluno-books/
├── packages/
│   ├── todo/              # 010 - Las Enseñanzas de la Ley del Uno
│   ├── jesus/             # 020 - El Camino del Amor
│   ├── sanacion/          # 021 - Sanación
│   ├── doctrinas/         # 100 - Doctrinas
│   ├── dormidos/          # 110 - Dormidos
│   ├── raw/               # Raw - distilled knowledge (raw.eluno.org, no root dev alias)
│   └── otramirada/        # Future book (placeholder, no package.json yet)
├── libros/                # Landing page for all books
├── ai/                    # AI writing methodology docs
├── docs/                  # Project documentation
└── README.md
```

## Related repositories

- **[eluno](https://github.com/chuchurex/eluno)** - The core philosophical book (000 - El Uno / The One)
- **[eluno-core](https://github.com/chuchurex/eluno-core)** - Shared build tools, styles, and fonts

## Technical

- **Source**: [L/L Research - The Ra Contact](https://www.llresearch.org/library/the-ra-contact-teaching-the-law-of-one)
- **Generated with**: Claude (Anthropic) for text, Edge TTS (`node-edge-tts`) for audiobooks
- **Hosted at**: [eluno.org](https://eluno.org) subdomains
- **Deployed via**: Cloudflare Pages (one project per book), Hostinger (static media)
- **License**: AGPL-3.0

### Deployment and credentials

Each book is a separate Cloudflare Pages project (`eluno-todo`, `eluno-jesus`, `eluno-sanacion`, `eluno-doctrinas`, `eluno-dormidos`, plus `eluno-libros` for the landing page). A push to `main` triggers all builds in parallel; each project builds its own package (`pnpm --filter @eluno/<book> build`, output in `packages/<book>/dist`). The real build config lives in the Cloudflare dashboard.

Media (audio, PDF, video) lives at `static.eluno.org/<slug>/` on Hostinger, outside the repo. It is uploaded over SSH using a private key (`UPLOAD_KEY_PATH`, together with `UPLOAD_HOST` / `UPLOAD_PORT` / `UPLOAD_USER` / `UPLOAD_DIR`), not a password. After uploading, purge the Cloudflare cache so new media is served.

Cloudflare env vars can be managed through the API using a scoped **API Token** (Bearer auth, scope `Pages:Edit`) - never the account Global API Key. Credentials and upload variables live in a gitignored `.env`; see `.env.example` for the full list of placeholders. Real secret values never get committed or deployed. Operational details for automation live in `AGENTS.md`.

## References

- Festinger, L. (1957). *A Theory of Cognitive Dissonance*. Stanford University Press.
- Brehm, J. W. (1966). *A Theory of Psychological Reactance*. Academic Press.
- Gurdjieff, G.I. - Fourth Way teachings on conscious shocks.
- L/L Research (1981-1984). *The Ra Contact: Teaching the Law of One*.
