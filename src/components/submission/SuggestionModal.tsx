'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ExternalLink,
  GitPullRequest,
  Check,
  AlertCircle,
  Key,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Philosopher, Concept } from '../../lib/types';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  philosophers: Philosopher[];
  concepts: Concept[];
  initialTargetNodeId?: string | null;
}

export function SuggestionModal({
  isOpen,
  onClose,
  philosophers,
  concepts,
  initialTargetNodeId,
}: SuggestionModalProps) {
  const repoSlug = process.env.NEXT_PUBLIC_GITHUB_REPO || 'tjirab/philosophia';

  const [category, setCategory] = useState<
    'influence' | 'podcast' | 'book' | 'synopsis' | 'new-thinker' | 'erratum'
  >('influence');
  const [targetId, setTargetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [sources, setSources] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [useDirectApi, setUseDirectApi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ url: string; number: number } | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTargetNodeId) {
      setTargetId(initialTargetNodeId);
    }
  }, [initialTargetNodeId, isOpen]);

  if (!isOpen) return null;

  const targetNode =
    philosophers.find((p) => p.id === targetId) ||
    concepts.find((c) => c.id === targetId);

  const targetName = targetNode ? (targetNode as any).name || (targetNode as any).title : targetId;

  // Build markdown issue body
  const generateIssueMarkdown = () => {
    return `### Category
${category}

### Target Node
${targetName ? `${targetName} (\`${targetId}\`)` : 'General / New Proposition'}

### Proposed Contribution / Change
${title ? `**Summary**: ${title}\n\n` : ''}${details}

### Sources & Citations
${sources || 'None provided'}

---
*Submitted via Philosophy Graph In-App Contributor Folio*`;
  };

  const handleOpenGitHubIssue = () => {
    const issueTitle = `[Suggestion]: ${title || `${category} for ${targetName || 'graph'}`}`;
    const body = generateIssueMarkdown();
    const encodedTitle = encodeURIComponent(issueTitle);
    const encodedBody = encodeURIComponent(body);
    const labels = encodeURIComponent('content-suggestion,triage');

    const issueUrl = `https://github.com/${repoSlug}/issues/new?title=${encodedTitle}&body=${encodedBody}&labels=${labels}`;
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleDirectApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) {
      setErrorMessage('Please enter a GitHub personal access token to submit directly via API, or use the "Open GitHub Issue" button below.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const issueTitle = `[Suggestion]: ${title || `${category} for ${targetName || 'graph'}`}`;
      const body = generateIssueMarkdown();

      const response = await fetch(`https://api.github.com/repos/${repoSlug}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: body,
          labels: ['content-suggestion', 'triage'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      setSubmissionSuccess({ url: data.html_url, number: data.number });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit issue to GitHub API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[var(--text-main)] font-serif">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--gold-bg)] text-[var(--gold-accent)] rounded-xl border border-[var(--gold-border)]">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--text-main)] tracking-wide">
                Contribute & Suggest Refinements
              </h3>
              <p className="text-xs text-[var(--text-dim)] font-serif">
                Propose new intellectual connections, podcast episodes, primary sources, or corrections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-hover)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {submissionSuccess ? (
            <div className="p-6 bg-[var(--bg-subtle)] border border-[var(--gold-border)] rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[var(--text-main)] font-serif">
                Suggestion Submitted Successfully!
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                Issue #{submissionSuccess.number} has been created in the repository. Thank you for helping refine the history of ideas.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={submissionSuccess.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[var(--gold-bg)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--bg-hover)] transition"
                >
                  View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs font-semibold hover:bg-[var(--bg-hover)] transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDirectApiSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                  Contribution Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none"
                >
                  <option value="influence">Influence Connection (Who influenced whom)</option>
                  <option value="podcast">Podcast Episode (Philosophize This! link)</option>
                  <option value="book">Key Text / Monograph / Paper citation</option>
                  <option value="synopsis">Synopsis or Central Question Refinement</option>
                  <option value="new-thinker">Propose a New Philosopher or Concept</option>
                  <option value="erratum">Data Correction / Date Erratum</option>
                </select>
              </div>

              {/* Target Thinker */}
              <div>
                <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                  Target Thinker or Concept
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none"
                >
                  <option value="">General (Not specific to one thinker)</option>
                  <optgroup label="Philosophers">
                    {philosophers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Concepts">
                    {concepts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title || (c as any).name || 'Concept'}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Title / Summary */}
              <div>
                <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                  Summary of Suggestion
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Connect Spinoza's ethics to Goethe's philosophy of nature"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none placeholder-[var(--text-dim)]"
                  required
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                  Details & Description
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Explain the intellectual relationship, chapter citation, or textual evidence..."
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none placeholder-[var(--text-dim)] font-serif"
                  required
                />
              </div>

              {/* Sources */}
              <div>
                <label className="block text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-1.5">
                  Sources, Links, or Citations
                </label>
                <input
                  type="text"
                  value={sources}
                  onChange={(e) => setSources(e.target.value)}
                  placeholder="e.g. Stanford Encyclopedia entry link, Philosophize This! Episode #112, DOI"
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl px-3 py-2 text-sm focus:border-[var(--gold-accent)] focus:outline-none placeholder-[var(--text-dim)]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-[var(--bg-subtle)] border border-rose-800/40 text-rose-500 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submission Buttons */}
              <div className="pt-3 border-t border-[var(--border-main)] space-y-3">
                {/* Method 1: Instant GitHub Issue URL (Zero config, universal) */}
                <button
                  type="button"
                  onClick={handleOpenGitHubIssue}
                  className="w-full py-2.5 px-4 bg-[var(--gold-bg)] hover:bg-[var(--bg-hover)] text-[var(--gold-accent)] border border-[var(--gold-border)] rounded-xl text-xs font-semibold tracking-wide transition shadow-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--gold-accent)]" />
                  <span>Submit via Pre-Filled GitHub Issue (Recommended)</span>
                </button>

                {/* Direct API Toggle */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setUseDirectApi(!useDirectApi)}
                    className="text-[11px] text-[var(--text-dim)] hover:text-[var(--text-main)] underline transition inline-flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>{useDirectApi ? 'Hide Direct API Options' : 'Or Submit In-App via GitHub Token'}</span>
                  </button>
                </div>

                {useDirectApi && (
                  <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl space-y-2 text-xs">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)]">
                      GitHub Personal Access Token (with <code>public_repo</code> or <code>issues:write</code> permission)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-[var(--gold-accent)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 px-3 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-main)] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-[var(--gold-accent)]" />
                      <span>{isSubmitting ? 'Submitting to GitHub...' : 'Submit Directly via API'}</span>
                    </button>
                  </div>
                )}

                {/* Method 3: Direct edit on GitHub links */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-[var(--text-dim)]">
                  <span>Direct Data Files:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <a
                      href={`https://github.com/${repoSlug}/tree/main/data/philosophers`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--gold-accent)] underline"
                    >
                      data/philosophers
                    </a>
                    <span>•</span>
                    <a
                      href={`https://github.com/${repoSlug}/tree/main/data/edges`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--gold-accent)] underline"
                    >
                      data/edges
                    </a>
                    <span>•</span>
                    <a
                      href={`https://github.com/${repoSlug}/tree/main/data/media`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--gold-accent)] underline"
                    >
                      data/media
                    </a>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
