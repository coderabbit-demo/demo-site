/** Loads the editable manifest and coordinates navigation, deep links, and playback. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Player } from "./Player";
import { featureEntries, formatTime, parseTour } from "./tour";
import type { FeatureEntry, NavigationNode, Tour } from "./tour";

type LoadState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly tour: Tour };

/** Fetches and validates the current configuration, with cancellation and a retry action. */
export function App(): ReactElement {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    void (async () => {
      try {
        const response = await fetch("/tour.json", {
          signal: controller.signal,
          cache: "no-cache",
        });
        if (!response.ok)
          throw new Error("The feature list couldn’t load. Please try again.");
        const data: unknown = await response.json();
        const tour = parseTour(data);
        if (!controller.signal.aborted) setState({ status: "ready", tour });
      } catch (error: unknown) {
        if (!controller.signal.aborted)
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The feature list is unavailable.",
          });
      }
    })();
    return () => {
      controller.abort();
    };
  }, [attempt]);

  if (state.status === "loading")
    return (
      <div className="loading-shell" role="status">
        <Brand />
        <div className="skeleton" />
        Loading your feature tour…
      </div>
    );
  if (state.status === "error")
    return (
      <div className="loading-shell">
        <Brand />
        <h1>The tour couldn’t load</h1>
        <p role="alert">{state.message}</p>
        <button
          onClick={() => {
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  return <TourView tour={state.tour} />;
}

/** Renders the official white logotype with its original aspect ratio. */
function Brand(): ReactElement {
  return (
    <div className="brand">
      <img
        src="/brand/coderabbit-white.svg"
        alt="CodeRabbit"
        width="2152"
        height="313"
      />
    </div>
  );
}

interface NavigationProps {
  readonly nodes: readonly NavigationNode[];
  readonly entries: readonly FeatureEntry[];
  readonly activeId: string;
  readonly expanded: ReadonlySet<string>;
  readonly toggle: (id: string) => void;
  readonly select: (id: string) => void;
  readonly progress: number;
}

/** Renders nested disclosure controls and selectable clips in manifest order. */
function Navigation({
  nodes,
  entries,
  activeId,
  expanded,
  toggle,
  select,
  progress,
}: NavigationProps): ReactElement {
  return (
    <ul className="feature-list">
      {nodes.map((node) => (
        <li key={node.id}>
          {node.kind === "category" ? (
            <>
              <button
                className="category-toggle"
                aria-expanded={expanded.has(node.id)}
                onClick={() => {
                  toggle(node.id);
                }}
              >
                <span>{node.title}</span>
                <span aria-hidden="true">
                  {expanded.has(node.id) ? "⌄" : "›"}
                </span>
              </button>
              {expanded.has(node.id) && (
                <Navigation
                  nodes={node.children}
                  entries={entries}
                  activeId={activeId}
                  expanded={expanded}
                  toggle={toggle}
                  select={select}
                  progress={progress}
                />
              )}
            </>
          ) : (
            <button
              className={`feature-row ${node.id === activeId ? "selected" : ""}`}
              aria-current={node.id === activeId ? "true" : undefined}
              onClick={() => {
                select(node.id);
              }}
            >
              <span className="feature-number">
                {(
                  entries.findIndex((entry) => entry.feature.id === node.id) + 1
                )
                  .toString()
                  .padStart(2, "0")}
              </span>
              <span className="feature-copy">
                <span className="feature-title">{node.title}</span>
                <span className="feature-description">{node.description}</span>
                {node.end !== null && (
                  <span className="feature-duration">
                    {formatTime(node.end - node.start)}
                  </span>
                )}
                {node.id === activeId && (
                  <span className="feature-progress" aria-hidden="true">
                    <span
                      style={{ transform: `scaleX(${progress.toString()})` }}
                    />
                  </span>
                )}
              </span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Resolves the URL's feature ID, falling back to the first configured clip. */
function selectedEntry(
  entries: readonly FeatureEntry[],
): FeatureEntry | undefined {
  const id = new URLSearchParams(window.location.search).get("feature");
  return entries.find((entry) => entry.feature.id === id) ?? entries[0];
}

/** Coordinates feature selection, sharing, search, and playback for a validated tour. */
function TourView({ tour }: { readonly tour: Tour }): ReactElement {
  const [entries] = useState(() => featureEntries(tour.navigation));
  const [activeId, setActiveId] = useState(
    () => selectedEntry(entries)?.feature.id ?? "",
  );
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        tour.navigation
          .filter((node) => node.kind === "category")
          .map((node) => node.id)
          .concat(
            selectedEntry(entries)?.parents.map((parent) => parent.id) ?? [],
          ),
      ),
  );
  const [progress, setProgress] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [advance, setAdvance] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [query, setQuery] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const active = entries.find((entry) => entry.feature.id === activeId);
  const index = entries.findIndex((entry) => entry.feature.id === activeId);

  /** Selects a known clip, reveals its ancestors, and synchronizes browser history. */
  const select = useCallback(
    (id: string, play = true, replace = false): void => {
      const entry = entries.find((item) => item.feature.id === id);
      if (!entry) return;
      setExpanded(
        (previous) =>
          new Set([...previous, ...entry.parents.map((parent) => parent.id)]),
      );
      setActiveId(id);
      setAutoplay(play);
      setProgress(0);
      setCopyStatus("");
      const url = new URL(window.location.href);
      if (url.searchParams.get("feature") !== id) {
        url.searchParams.set("feature", id);
        if (replace) window.history.replaceState(null, "", url);
        else window.history.pushState(null, "", url);
      }
      drawer.current?.close();
    },
    [entries],
  );

  useEffect(() => {
    /** Restores URL selection without autoplay or adding another history entry. */
    function popstate(): void {
      const entry = selectedEntry(entries);
      if (entry) select(entry.feature.id, false, true);
    }
    popstate();
    window.addEventListener("popstate", popstate);
    return () => {
      window.removeEventListener("popstate", popstate);
    };
  }, [entries, select]);

  useEffect(() => {
    document.title = active
      ? `${active.feature.title} · CodeRabbit`
      : "Feature Tour · CodeRabbit";
  }, [active]);

  /** Toggles one category without mutating the previous expansion state. */
  function toggle(id: string): void {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Copies the active feature URL and reports clipboard support or permission failures. */
  function copyLink(): void {
    const url = new URL(window.location.href);
    url.searchParams.set("feature", activeId);
    if (!navigator.clipboard) {
      setCopyStatus(
        "Copy the page address from your browser to share this demo.",
      );
      return;
    }
    void navigator.clipboard
      .writeText(url.href)
      .then(() => {
        setCopyStatus("Link copied");
      })
      .catch(() => {
        setCopyStatus(
          "Couldn’t copy. Copy the page address from your browser instead.",
        );
      });
  }

  const matching = query.trim()
    ? entries
        .filter(({ feature, parents }) =>
          `${feature.title} ${feature.description} ${parents.map((parent) => parent.title).join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .map((entry) => entry.feature)
    : tour.navigation;
  const nav = (
    <>
      <div className="sidebar-heading">
        <p>{tour.title}</p>
        <span>{entries.length.toString()} demos</span>
      </div>
      <label className="search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          aria-label="Find a feature"
          placeholder="Find a feature…"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
          }}
        />
      </label>
      <nav aria-label="Features">
        <Navigation
          nodes={matching}
          entries={entries}
          activeId={activeId}
          expanded={expanded}
          toggle={toggle}
          select={select}
          progress={progress}
        />
        {query.trim().length > 0 && matching.length === 0 && (
          <p className="no-results">
            No features match “{query}”. Try another search.
          </p>
        )}
      </nav>
    </>
  );
  const media = active ? tour.media.get(active.feature.mediaId) : undefined;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to demo
      </a>
      <aside className="sidebar">
        <Brand />
        <p className="tour-intro">{tour.description}</p>
        {nav}
        <div className="sidebar-footer">
          <span className="status-dot" /> A little less review. A lot more flow.
        </div>
      </aside>
      <div className="mobile-header">
        <Brand />
        <button
          onClick={() => {
            drawer.current?.showModal();
          }}
        >
          Browse features ☰
        </button>
      </div>
      <dialog
        ref={drawer}
        className="feature-drawer"
        aria-label="Browse features"
      >
        <div className="drawer-heading">
          <Brand />
          <button
            aria-label="Close feature menu"
            onClick={() => {
              drawer.current?.close();
            }}
          >
            ✕
          </button>
        </div>
        {nav}
      </dialog>
      <main id="main" tabIndex={-1}>
        <header className="main-header">
          <div className="breadcrumb">
            <span>Feature tour</span>
            <span aria-hidden="true">/</span>
            <span>{active?.parents.at(-1)?.title ?? "Explore"}</span>
          </div>
          <a
            className="product-link"
            href="https://app.coderabbit.ai"
            target="_blank"
            rel="noreferrer"
          >
            Open CodeRabbit <span aria-hidden="true">↗</span>
          </a>
        </header>
        {active && media ? (
          <>
            <div className="demo-heading">
              <div>
                <p className="demo-count">
                  Demo {(index + 1).toString().padStart(2, "0")}{" "}
                  <span>/ {entries.length.toString().padStart(2, "0")}</span>
                </p>
                <h1>{active.feature.title}</h1>
                <p>{active.feature.description}</p>
              </div>
              <button className="copy-button" onClick={copyLink}>
                <span aria-hidden="true">↗</span> Copy link
              </button>
            </div>
            <p className="copy-status" role="status">
              {copyStatus}
            </p>
            <section className="demo-stage" aria-label="Feature demonstration">
              <div className="stage-toolbar">
                <span className="window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{active.feature.title}</span>
                <span className="stage-label">DEMO</span>
              </div>
              <Player
                key={activeId}
                feature={active.feature}
                media={media}
                autoplay={autoplay}
                onProgress={setProgress}
                onComplete={() => {
                  const next = entries[index + 1];
                  if (advance && next) select(next.feature.id);
                }}
              />
            </section>
            <footer className="demo-footer">
              <label className="advance-toggle">
                <input
                  type="checkbox"
                  checked={advance}
                  onChange={(event) => {
                    setAdvance(event.currentTarget.checked);
                  }}
                />
                <span>Play next automatically</span>
              </label>
              <div className="step-buttons">
                <button
                  disabled={index <= 0}
                  onClick={() => {
                    const previous = entries[index - 1];
                    if (previous) select(previous.feature.id);
                  }}
                >
                  ← Previous
                </button>
                <button
                  className="next-button"
                  disabled={index >= entries.length - 1}
                  onClick={() => {
                    const next = entries[index + 1];
                    if (next) select(next.feature.id);
                  }}
                >
                  Next feature →
                </button>
              </div>
            </footer>
            <p className="bottom-note">
              Your code. Your context. A second pair of eyes.
            </p>
          </>
        ) : (
          <section className="empty-tour">
            <h1>Your feature tour is on its way</h1>
            <p>Check back soon for a closer look at CodeRabbit.</p>
          </section>
        )}
      </main>
    </div>
  );
}
