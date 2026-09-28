import { FiClock, FiExternalLink } from "react-icons/fi";

const formatUpdatedAt = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const RecentDocuments = ({ documents, onOpen }) => {
  return (
    <section aria-labelledby='recent-documents'>
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <h2 id='recent-documents' className='font-semibold text-ampere-black dark:text-white'>
            Recent documents
          </h2>
          <p className='mt-1 text-sm text-ampere-muted dark:text-neutral-400'>Your latest generation jobs and drafts.</p>
        </div>
        <FiClock className='text-ampere-muted dark:text-neutral-400' size={18} />
      </div>

      <div className='border-t border-ampere-line dark:border-neutral-800'>
        {!documents.length && (
          <p className='border-b border-ampere-line py-5 text-sm text-ampere-muted dark:border-neutral-800 dark:text-neutral-400'>
            No document jobs yet.
          </p>
        )}
        {documents.map((document, index) => (
          <article
            key={`${document.title}-${index}`}
            className='flex items-start justify-between gap-5 border-b border-ampere-line py-5 dark:border-neutral-800'
          >
            <div className='min-w-0'>
              <p className='truncate font-medium text-ampere-black dark:text-white'>{document.title}</p>
              <p className='mt-1 text-sm text-ampere-muted dark:text-neutral-400'>{document.template}</p>
              <p className='mt-3 text-xs text-ampere-muted dark:text-neutral-500'>
                {formatUpdatedAt(document.updated_at ?? document.updatedAt)}
              </p>
            </div>
            <div className='flex shrink-0 items-center gap-3'>
              <span
                className={`text-xs font-semibold ${
                  document.status === "Generating"
                    ? "text-ampere-red"
                    : document.status === "Published"
                      ? "text-ampere-charcoal dark:text-neutral-200"
                      : "text-ampere-muted dark:text-neutral-400"
                }`}
              >
                {document.status}
              </span>
              <button
                type='button'
                title={`Preview ${document.title}`}
                aria-label={`Preview ${document.title}`}
                onClick={() => onOpen(document)}
                className='text-ampere-muted transition-colors hover:text-ampere-red dark:text-neutral-400'
              >
                <FiExternalLink size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentDocuments;
