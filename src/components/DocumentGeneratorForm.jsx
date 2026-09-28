import { useState } from "react";
import { FiCheck, FiEdit2, FiFileText, FiRefreshCw } from "react-icons/fi";

const DocumentGeneratorForm = ({
  connectionState,
  confluenceConnection,
  confluenceSiteUrl,
  confluenceEmail,
  confluenceToken,
  confluenceError,
  title,
  instructions,
  sourceFiles,
  targetUrl,
  referenceConfluenceUrl,
  confluencePublishUrl,
  isGenerating,
  generationError,
  onTitleChange,
  onConfluenceSiteUrlChange,
  onConfluenceEmailChange,
  onConfluenceTokenChange,
  onSaveConfluenceConnection,
  onInstructionsChange,
  onSourceFilesChange,
  onTargetUrlChange,
  onReferenceConfluenceUrlChange,
  onConfluencePublishUrlChange,
  onSubmit,
}) => {
  const [showConnectionForm, setShowConnectionForm] = useState(false);

  return (
  <form id='generator' onSubmit={onSubmit} className='border-y border-ampere-line bg-white py-7 md:px-8 dark:border-neutral-800 dark:bg-ampere-charcoal'>
    <div className='mb-7 flex items-center gap-3'>
      <span className='flex h-8 w-8 items-center justify-center bg-ampere-red text-white'><FiFileText size={17} /></span>
      <div>
        <h2 className='font-semibold text-ampere-black dark:text-white'>Generate a guide</h2>
        <p className='text-sm text-ampere-muted dark:text-neutral-400'>Describe the requested workflow. Codex uses the installed SLT and Confluence skills; the UI asks before a required SLT write.</p>
      </div>
    </div>

    <div className='mb-7 flex items-center justify-between gap-4 border-y border-ampere-line py-4 dark:border-neutral-800'>
      <div className='min-w-0'>
        <p className='text-sm font-medium text-ampere-black dark:text-white'>Confluence</p>
        <p className='mt-1 truncate text-sm text-ampere-muted dark:text-neutral-400'>
          {connectionState === "connected" ? `Publishing as ${confluenceConnection.email}` : "Add your scoped API token before publishing."}
        </p>
      </div>
      {connectionState === "connected" ? (
        <div className='flex shrink-0 items-center gap-3'>
          <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-green-700'><FiCheck size={16} />Connected</span>
          <button
            type='button'
            onClick={() => setShowConnectionForm((current) => !current)}
            className='inline-flex items-center gap-1.5 text-sm font-medium text-ampere-red hover:text-ampere-red-dark'
          >
            <FiEdit2 size={15} />{showConnectionForm ? "Cancel" : "Change connection"}
          </button>
        </div>
      ) : null}
    </div>
    {(connectionState !== "connected" || showConnectionForm) && (
      <div className='grid gap-3 border-b border-ampere-line pb-5 dark:border-neutral-800 md:grid-cols-3'>
        <input type='url' value={confluenceSiteUrl} onChange={(event) => onConfluenceSiteUrlChange(event.target.value)} className='h-10 border border-ampere-line bg-white px-3 text-sm text-ampere-black dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='https://your-site.atlassian.net' />
        <input type='email' value={confluenceEmail} onChange={(event) => onConfluenceEmailChange(event.target.value)} className='h-10 border border-ampere-line bg-white px-3 text-sm text-ampere-black dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='you@company.com' />
        <div className='flex gap-2'>
          <input type='password' value={confluenceToken} onChange={(event) => onConfluenceTokenChange(event.target.value)} className='min-w-0 flex-1 border border-ampere-line bg-white px-3 text-sm text-ampere-black dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='Scoped API token' />
          <button type='button' onClick={onSaveConfluenceConnection} className='bg-ampere-black px-3 text-sm font-semibold text-white dark:bg-ampere-red'>Save</button>
        </div>
        {confluenceError && <p className='text-sm text-ampere-red md:col-span-3'>{confluenceError}</p>}
      </div>
    )}

    <div className='grid gap-5 md:grid-cols-2'>
      <label className='grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200 mt-4'>
        Guide title
        <input value={title} onChange={(event) => onTitleChange(event.target.value)} className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='e.g. SLT Web - LOT Setup guide' />
      </label>
      <label className='grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200 mt-4'>
        Target SLT Web URL
        <input type='url' value={targetUrl} onChange={(event) => onTargetUrlChange(event.target.value)} className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='http://slt-web.example.com:4200/' />
      </label>
      
    </div>

    <label className='mt-5 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
      Code files
      <input type='file' multiple accept='.zip,.py,.js,.jsx,.ts,.tsx,.html,.css,.scss,.json,.md' onChange={(event) => onSourceFilesChange(Array.from(event.target.files || []))} className='block w-full text-sm text-ampere-muted dark:text-neutral-400' />
      <span className='text-xs font-normal text-ampere-muted dark:text-neutral-400'>{sourceFiles.length ? `${sourceFiles.length} file(s) selected` : 'Upload a ZIP or select the source files relevant to this guide.'}</span>
    </label>

    <label className='mt-5 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
      Documentation request
      <textarea value={instructions} onChange={(event) => onInstructionsChange(event.target.value)} className='min-h-[9rem] resize-y border border-ampere-line bg-white p-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='Paste the ticket context and describe the guide you need: target readers, expected user workflow, exclusions, screenshots, and any approved state-changing actions.' />
    </label>

    <details className='mt-5 border-t border-ampere-line pt-5 dark:border-neutral-800'>
      <summary className='cursor-pointer text-sm font-medium text-ampere-black dark:text-neutral-200'>Confluence Pages URL settings</summary>
      <label className='mt-4 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
        Reference page URL
        <input type='url' value={referenceConfluenceUrl} onChange={(event) => onReferenceConfluenceUrlChange(event.target.value)} className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='Used only as a writing reference' />
      </label>
      <label className='mt-5 grid gap-2 text-sm font-medium text-ampere-black dark:text-neutral-200'>
        Publish page URL
        <input type='url' value={confluencePublishUrl} onChange={(event) => onConfluencePublishUrlChange(event.target.value)} className='h-11 border border-ampere-line bg-white px-3 text-sm font-normal text-ampere-black outline-none focus:border-ampere-red dark:border-neutral-700 dark:bg-ampere-black dark:text-white' placeholder='Existing Confluence page to update when you publish' />
      </label>
    </details>

    <div className='mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ampere-line pt-5 dark:border-neutral-800'>
      <div>
        {generationError && <p className='mt-2 text-sm text-ampere-red'>{generationError}</p>}
      </div>
      <button type='submit' disabled={isGenerating} className='inline-flex items-center gap-2 bg-ampere-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ampere-red-dark disabled:cursor-not-allowed disabled:opacity-60'>
        <FiRefreshCw size={16} />{isGenerating ? "Generating..." : "Generate guide"}
      </button>
    </div>
  </form>
  );
};

export default DocumentGeneratorForm;
