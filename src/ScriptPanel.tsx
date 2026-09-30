/** Readable companion guide; scrolling never changes video playback. */
import type { ReactElement } from "react";
import { formatTime } from "./tour";
import type { Guide } from "./tour";

interface ScriptPanelProps {
  readonly guide: Guide;
  readonly hidden: boolean;
}

/** Displays validated guide text and source downloads without interpreting HTML. */
export function ScriptPanel({ guide, hidden }: ScriptPanelProps): ReactElement {
  return (
    <aside
      className="script-panel"
      id="demo-script"
      aria-labelledby="script-title"
      hidden={hidden}
    >
      <header className="script-heading">
        <h2 id="script-title">{guide.title}</h2>
        <div className="script-downloads">
          {guide.pdf && (
            <a href={guide.pdf} target="_blank" rel="noreferrer">
              Open PDF ↗
            </a>
          )}
          <a href={guide.download} download>
            Download script
          </a>
        </div>
      </header>
      <div
        className="script-body"
        tabIndex={0}
        role="region"
        aria-label="Do, Say, See script"
      >
        {guide.steps.map((step, index) => (
          <section
            className="script-step"
            key={index}
            aria-labelledby={`script-step-${index.toString()}`}
          >
            <p className="script-time">
              {formatTime(step.start)} – {formatTime(step.end)}
            </p>
            <h3 id={`script-step-${index.toString()}`}>{step.title}</h3>
            <dl>
              <dt>Do</dt>
              <dd>
                <ul>
                  {step.do.map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
              </dd>
              <dt>Say</dt>
              <dd className="script-narration">{step.say}</dd>
              <dt>See</dt>
              <dd>{step.see}</dd>
            </dl>
            {step.links.length > 0 && (
              <ul className="script-links">
                {step.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
}
