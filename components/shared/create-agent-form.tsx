"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";

interface CreateAgentResult {
  ok: boolean;
  agent?: {
    id: string;
    name: string;
    slug: string;
    pubkey: string;
    api_key: string;
    api_key_prefix: string;
  };
  note?: string;
  error?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function CreateAgentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CreateAgentResult | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPubkey, setCopiedPubkey] = useState(false);

  const derivedSlug = slugTouched && slug ? slug : slugify(name);

  const reset = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setResult(null);
    setCopiedKey(false);
    setCopiedPubkey(false);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => {
          if (open) reset();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface)/60 px-4 py-1.5 text-sm font-semibold text-(--foreground) transition-colors hover:border-(--accent)/40"
      >
        {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {open ? "Cancel" : "Create new agent"}
      </button>

      {open && !result?.ok ? (
        <form
          className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-(--border) bg-(--surface)/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            const finalSlug = slugTouched && slug ? slugify(slug) : slugify(name);
            startTransition(async () => {
              const res = await fetch("/api/admin/provision-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: name.trim(),
                  slug: finalSlug,
                  description: description.trim() || undefined,
                }),
              });
              const body = (await res
                .json()
                .catch(() => ({}))) as CreateAgentResult;
              if (!res.ok) {
                setResult({
                  ok: false,
                  error: body.error ?? `${res.status} ${res.statusText}`,
                });
                return;
              }
              setResult(body);
              router.refresh();
            });
          }}
        >
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tsubaki Volatility"
              minLength={2}
              maxLength={80}
              required
              className="w-full rounded-md border border-(--border) bg-black/30 px-2.5 py-1.5 text-sm text-(--foreground) outline-none focus:border-(--accent)/60"
            />
          </Field>
          <Field
            label="Slug"
            hint="Auto-derived from name. Letters/digits/dashes only."
          >
            <input
              type="text"
              value={derivedSlug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="tsubaki-volatility"
              pattern="[a-z0-9\-]+"
              minLength={2}
              maxLength={60}
              className="w-full rounded-md border border-(--border) bg-black/30 px-2.5 py-1.5 font-mono text-xs text-(--foreground) outline-none focus:border-(--accent)/60"
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One sentence about the agent's strategy or focus."
              maxLength={280}
              rows={2}
              className="w-full rounded-md border border-(--border) bg-black/30 px-2.5 py-1.5 text-sm text-(--foreground) outline-none focus:border-(--accent)/60"
            />
          </Field>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pending || name.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-4 py-1.5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create agent"}
            </button>
            {result?.error ? (
              <span className="text-xs text-rose-400">
                Failed: {result.error}
              </span>
            ) : null}
          </div>
        </form>
      ) : null}

      {result?.ok && result.agent ? (
        <div className="w-full max-w-md rounded-2xl border border-(--warning)/40 bg-(--warning)/5 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--warning)">
            <AlertTriangle className="h-3.5 w-3.5" />
            new agent · credentials shown once
          </div>
          <p className="mt-2 text-xs text-(--muted)">
            Save the API key now. Only its sha256 is stored — there is no way to
            recover it later. Use as{" "}
            <code className="font-mono">Authorization: Bearer …</code> on MCP{" "}
            <code className="font-mono">commit_memory</code> calls.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <CredentialRow
              label="agent"
              value={result.agent.slug}
              link={`/agents/${result.agent.slug}`}
            />
            <CredentialRow
              label="onchain pubkey"
              value={result.agent.pubkey}
              copyable
              copied={copiedPubkey}
              onCopy={async () => {
                await navigator.clipboard.writeText(result.agent!.pubkey);
                setCopiedPubkey(true);
                setTimeout(() => setCopiedPubkey(false), 1500);
              }}
            />
            <CredentialRow
              label="api key"
              value={result.agent.api_key}
              copyable
              copied={copiedKey}
              onCopy={async () => {
                await navigator.clipboard.writeText(result.agent!.api_key);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 1500);
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/agents/${result.agent.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--accent) hover:underline"
            >
              View profile <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-(--muted) hover:text-(--foreground)"
            >
              Create another
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] text-(--muted)">{hint}</span>
      ) : null}
    </label>
  );
}

function CredentialRow({
  label,
  value,
  link,
  copyable,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  link?: string;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-lg bg-black/40 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--muted)">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {link ? (
          <Link
            href={link}
            className="flex-1 truncate font-mono text-xs text-(--accent) hover:underline"
          >
            {value}
          </Link>
        ) : (
          <code className="flex-1 truncate font-mono text-xs text-(--foreground)">
            {value}
          </code>
        )}
        {copyable && onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--surface)/60 px-2 py-1 text-[11px] font-medium text-(--foreground) transition-colors hover:border-(--accent)/40"
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                copy
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

