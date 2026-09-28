import { useEffect, useState } from "react";
import { FiExternalLink, FiSend, FiX } from "react-icons/fi";
import { apiFetch } from "../lib/api";

const evidenceImagePath = (jobId, stepNumber) =>
  `/api/documents/jobs/${jobId}/evidence/${stepNumber}/image`;

const renderDraftWithEvidence = async (job, objectUrls) => {
  if (!job.draft_content || !job.evidence?.length || typeof window === "undefined") return job.draft_content;
  const evidenceByStep = new Map(job.evidence.map((evidence) => [evidence.step_number, evidence]));
  const imageUrls = new Map();
  await Promise.all(
    job.evidence.map(async (evidence) => {
      const response = await apiFetch(evidenceImagePath(job.id, evidence.step_number));
      if (!response.ok) return;
      const imageUrl = URL.createObjectURL(await response.blob());
      objectUrls.push(imageUrl);
      imageUrls.set(evidence.step_number, imageUrl);
    }),
  );
  const parsed = new window.DOMParser().parseFromString(job.draft_content, "text/html");
  parsed.body.querySelectorAll("img").forEach((image) => {
    const source = image.getAttribute("src") || "";
    const filename = source.split("/").pop();
    const evidence = job.evidence.find((item) => item.filename.endsWith(filename));
    const imageUrl = evidence && imageUrls.get(evidence.step_number);
    if (imageUrl) image.src = imageUrl;
  });
  parsed.body.querySelectorAll("p").forEach((paragraph) => {
    const match = paragraph.textContent.trim().match(/^Screenshot pending: step (\d+)$/i);
    const evidence = match && evidenceByStep.get(Number(match[1]));
    const imageUrl = evidence && imageUrls.get(evidence.step_number);
    if (!evidence || !imageUrl) return;
    const figure = parsed.createElement("figure");
    const image = parsed.createElement("img");
    const caption = parsed.createElement("figcaption");
    image.src = imageUrl;
    image.alt = evidence.alt_text;
    image.loading = "lazy";
    caption.textContent = `Step ${evidence.step_number}: ${evidence.alt_text}`;
    figure.append(image, caption);
    paragraph.replaceWith(figure);
  });
  return parsed.body.innerHTML;
};

const DraftPreview = ({
  document,
  onClose,
  onOperationConfirm,
  operationMessage,
  operationState,
  onPublish,
  publishMessage,
  publishState,
}) => {
  const [draftHtml, setDraftHtml] = useState(document.draft_content || "");
  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false);
  const [value, setValue] = useState("");
  const operation = document.pending_approval;
  const valueRequired = Boolean(operation?.value_required);

  useEffect(() => {
    const objectUrls = [];
    let cancelled = false;

    renderDraftWithEvidence(document, objectUrls)
      .then((html) => {
        if (cancelled) return;
        setDraftHtml(html);
      })
      .catch(() => {
        if (!cancelled) setDraftHtml(document.draft_content || "");
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [document]);

  return (
    <div role='dialog' aria-modal='true' aria-labelledby='draft-preview-title' className='fixed inset-0 z-[100] flex items-center justify-center bg-ampere-black/60 px-4 py-6'>
      <section className='flex h-full  w-full max-w-7xl flex-col bg-white dark:bg-ampere-charcoal'>
        <header className='flex items-center justify-between border-b border-ampere-line px-5 py-4 dark:border-neutral-800'>
          <div className='min-w-0'>
            <p className='text-xs font-semibold uppercase tracking-widest text-ampere-red'>Draft preview</p>
            <h2 id='draft-preview-title' className='mt-1 truncate font-semibold text-ampere-black dark:text-white'>{document.title}</h2>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {document.status !== "Published" && (
              <button
                type='button'
                title='Publish this draft to Confluence'
                aria-label='Publish this draft to Confluence'
                onClick={() => setShowPublishConfirmation(true)}
                disabled={publishState === "loading"}
                className='inline-flex items-center gap-2 bg-ampere-red px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-ampere-red-dark disabled:cursor-not-allowed disabled:opacity-60'
              >
                <FiSend size={16} />Publish
              </button>
            )}
            <button type='button' title='Close preview' aria-label='Close preview' onClick={onClose} className='flex h-9 w-9 items-center justify-center text-ampere-muted transition-colors hover:text-ampere-red dark:text-neutral-400'>
              <FiX size={20} />
            </button>
          </div>
        </header>
        <div className='min-h-0 flex-1 overflow-y-auto bg-white p-5 dark:bg-ampere-black md:p-8'>
          {operation?.action && (
            <section className='mx-auto mb-5 max-w-3xl border border-ampere-red bg-ampere-surface p-4 dark:bg-ampere-black'>
              <p className='text-xs font-semibold uppercase tracking-widest text-ampere-red'>Confirmation required</p>
              <h3 className='mt-1 font-semibold text-ampere-black dark:text-white'>{operation.action}</h3>
              {operation.label && <p className='mt-2 text-sm text-ampere-muted dark:text-neutral-400'>Control: {operation.label}</p>}
              {operation.expected_result && <p className='mt-1 text-sm text-ampere-muted dark:text-neutral-400'>Expected result: {operation.expected_result}</p>}
              {operation.target_url && <p className='mt-2 break-all text-xs text-ampere-muted dark:text-neutral-500'>Target: {operation.target_url}</p>}
              {valueRequired && (
                <input
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className='mt-4 h-10 w-full border border-ampere-line bg-white px-3 text-sm text-ampere-black dark:border-neutral-700 dark:bg-ampere-charcoal dark:text-white'
                  placeholder='Enter the value you approve'
                />
              )}
              <div className='mt-4 flex justify-end gap-3'>
                <button type='button' onClick={() => onOperationConfirm("reject")} disabled={operationState === "loading"} className='px-3 py-2 text-sm font-medium text-ampere-muted'>Reject</button>
                <button
                  type='button'
                  onClick={() => onOperationConfirm("approve", value)}
                  disabled={operationState === "loading" || (valueRequired && !value.trim())}
                  className='bg-ampere-red px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {operationState === "loading" ? "Working..." : "Approve"}
                </button>
              </div>
            </section>
          )}
          {operationMessage && (
            <p className={`mx-auto mb-5 max-w-3xl border-l-2 px-3 py-2 text-sm ${operationState === "error" ? "border-ampere-red text-ampere-red" : "border-ampere-charcoal text-ampere-muted dark:border-neutral-400 dark:text-neutral-300"}`}>
              {operationMessage}
            </p>
          )}
          <p className='mx-auto mb-5 max-w-3xl border-l-2 border-ampere-charcoal px-3 py-2 text-sm text-ampere-muted dark:border-neutral-400 dark:text-neutral-300'>
            Draft generation: <strong>{document.draft_generation_mode || "Codex skills"}</strong>
            {document.draft_generation_model ? ` (${document.draft_generation_model})` : ""}
            {document.draft_generation_error ? ` - ${document.draft_generation_error}` : ""}
          </p>
          {publishMessage && (
            <p className={`mx-auto mb-5 max-w-3xl border-l-2 px-3 py-2 text-sm ${publishState === "error" ? "border-ampere-red text-ampere-red" : "border-ampere-charcoal text-ampere-muted dark:border-neutral-400 dark:text-neutral-300"}`}>
              {publishMessage}
            </p>
          )}
          {showPublishConfirmation && (
            <section className='mx-auto mb-5 max-w-3xl border border-ampere-red bg-ampere-surface p-4 dark:bg-ampere-black'>
              <h3 className='font-semibold text-ampere-black dark:text-white'>Confirm Confluence publish</h3>
              <p className='mt-2 text-sm leading-6 text-ampere-muted dark:text-neutral-400'>
                Update the configured Confluence page with this guide using your saved Confluence API token.
              </p>
              <p className='mt-2 break-all text-xs text-ampere-muted dark:text-neutral-500'>Page: {document.confluence_publish_url || "Not configured"}</p>
              <div className='mt-4 flex justify-end gap-3'>
                <button type='button' onClick={() => setShowPublishConfirmation(false)} className='px-3 py-2 text-sm font-medium text-ampere-muted'>Cancel</button>
                <button type='button' onClick={() => { setShowPublishConfirmation(false); onPublish(); }} disabled={publishState === "loading"} className='inline-flex items-center gap-2 bg-ampere-red px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60'>
                  <FiSend size={16} />{publishState === "loading" ? "Publishing..." : "Publish now"}
                </button>
              </div>
            </section>
          )}
          {document.confluence_page_url && (
            <a href={document.confluence_page_url} target='_blank' rel='noreferrer' className='mx-auto mb-5 flex max-w-3xl items-center gap-2 border-l-2 border-ampere-red px-3 py-2 text-sm font-medium text-ampere-red'>
              <FiExternalLink size={16} />Open published Confluence page
            </a>
          )}
          {document.draft_content ? (
            <article className='mx-auto max-w-3xl text-sm leading-6 text-ampere-black dark:text-neutral-200 [&_code]:bg-ampere-surface [&_code]:px-1 [&_code]:py-0.5 [&_figure]:my-4 [&_figcaption]:mt-2 [&_figcaption]:text-xs [&_figcaption]:text-ampere-muted [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-ampere-line [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ampere-black [&_img]:max-h-[32rem] [&_img]:w-full [&_img]:border [&_img]:border-ampere-line [&_li]:my-3 [&_p]:my-3 dark:[&_code]:bg-ampere-charcoal dark:[&_figcaption]:text-neutral-400 dark:[&_h2]:border-neutral-800 dark:[&_h2]:text-white dark:[&_img]:border-neutral-700' dangerouslySetInnerHTML={{ __html: draftHtml }} />
          ) : <p className='text-sm text-ampere-muted dark:text-neutral-400'>No draft content is available yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default DraftPreview;
