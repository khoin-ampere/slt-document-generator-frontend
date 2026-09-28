import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import DocumentGeneratorForm from "./components/DocumentGeneratorForm";
import DraftPreview from "./components/DraftPreview";
import LoginPage from "./components/LoginPage";
import RecentDocuments from "./components/RecentDocuments";
import {
  apiBaseUrl,
  apiFetch,
  clearAuthSession,
  getRefreshToken,
  saveAuthSession,
} from "./lib/api";
const App = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [authState, setAuthState] = useState("loading");
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sourceFiles, setSourceFiles] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [referenceConfluenceUrl, setReferenceConfluenceUrl] = useState("");
  const [confluencePublishUrl, setConfluencePublishUrl] = useState("");
  const [documents, setDocuments] = useState([]);
  const [confluenceConnection, setConfluenceConnection] = useState(null);
  const [connectionState, setConnectionState] = useState("loading");
  const [confluenceSiteUrl, setConfluenceSiteUrl] = useState("");
  const [confluenceEmail, setConfluenceEmail] = useState("");
  const [confluenceToken, setConfluenceToken] = useState("");
  const [confluenceError, setConfluenceError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [operationState, setOperationState] = useState("idle");
  const [operationMessage, setOperationMessage] = useState("");
  const [publishState, setPublishState] = useState("idle");
  const [publishMessage, setPublishMessage] = useState("");

  const replaceDocument = (document) => {
    setSelectedDocument(document);
    setDocuments((current) => {
      const existing = current.some((item) => item.id === document.id);
      return existing
        ? current.map((item) => (item.id === document.id ? document : item))
        : [document, ...current];
    });
  };

  useEffect(() => {
    const restoreSession = async () => {
      const refresh = getRefreshToken();

      if (!refresh) {
        setAuthState("unauthenticated");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });

        if (!response.ok) {
          clearAuthSession();
          setAuthState("unauthenticated");
          return;
        }

        const payload = await response.json();
        saveAuthSession(payload);
        setUser(payload.user);
        setAuthState("authenticated");
      } catch {
        clearAuthSession();
        setAuthState("unauthenticated");
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") {
      setConfluenceConnection(null);
      setConnectionState("loading");
      return;
    }
    const loadConnection = async () => {
      try {
        const response = await apiFetch("/api/integrations/confluence/connection");
        if (!response.ok) {
          setConnectionState("disconnected");
          return;
        }
        const connections = await response.json();
        setConfluenceConnection(connections[0] ?? null);
        setConnectionState(connections.length ? "connected" : "disconnected");
      } catch {
        setConnectionState("unavailable");
      }
    };
    loadConnection();
  }, [authState]);

  useEffect(() => {
    if (authState !== "authenticated") {
      setDocuments([]);
      return;
    }
    const loadDocuments = async () => {
      try {
        const response = await apiFetch("/api/documents/jobs");
        if (response.ok) setDocuments(await response.json());
      } catch {
        setDocuments([]);
      }
    };
    loadDocuments();
  }, [authState]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  const handleSaveConfluenceConnection = async () => {
    setConfluenceError("");
    try {
      const response = await apiFetch("/api/integrations/confluence/connection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_url: confluenceSiteUrl.trim(),
          email: confluenceEmail.trim(),
          token: confluenceToken,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.detail ?? "Unable to save the Confluence token.");
      setConfluenceConnection(payload);
      setConnectionState("connected");
      setConfluenceToken("");
    } catch (error) {
      setConfluenceError(error.message);
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerationError("");
    setIsGenerating(true);
    try {
      const response = await apiFetch("/api/documents/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "SLT Docs Generator",
          template: "operator-maintainer",
          title: title.trim() || "SLT Web guide",
          instructions,
          target_url: targetUrl.trim(),
          audiences: ["operator", "maintainer"],
          reference_confluence_url: referenceConfluenceUrl.trim(),
          confluence_publish_url: confluencePublishUrl.trim(),
        }),
      });
      const createdDocument = await response.json().catch(() => null);
      if (!response.ok) throw new Error(createdDocument?.detail ?? "Unable to create the document job.");
      if (!sourceFiles.length) throw new Error("Select a ZIP or one or more source files before generating.");

      const formData = new FormData();
      sourceFiles.forEach((file) => formData.append("files", file));
      const uploadResponse = await apiFetch(`/api/documents/jobs/${createdDocument.id}/source-files`, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => null);
        throw new Error(payload?.detail ?? "Unable to upload source files.");
      }

      const generateResponse = await apiFetch(`/api/documents/jobs/${createdDocument.id}/generate-codex`, {
        method: "POST",
      });
      const document = await generateResponse.json().catch(() => null);
      if (!generateResponse.ok) throw new Error(document?.detail ?? "Codex could not generate the guide.");
      replaceDocument(document);
      setTitle("");
      setInstructions("");
      setSourceFiles([]);
      setTargetUrl("");
      setReferenceConfluenceUrl("");
      setConfluencePublishUrl("");
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOperationConfirm = async (decision, value = "") => {
    if (!selectedDocument) return;
    setOperationState("loading");
    setOperationMessage("");
    try {
      const response = await apiFetch(`/api/documents/jobs/${selectedDocument.id}/operation/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, value }),
      });
      const document = await response.json().catch(() => null);
      if (!response.ok) throw new Error(document?.detail ?? "Unable to complete the confirmed operation.");
      replaceDocument(document);
      setOperationState("complete");
      setOperationMessage(decision === "approve" ? "Confirmed operation completed." : "Operation rejected.");
    } catch (error) {
      setOperationState("error");
      setOperationMessage(error.message);
    }
  };

  const handleOpenDocument = async (document) => {
    try {
      const response = await apiFetch(`/api/documents/jobs/${document.id}`);
      replaceDocument(response.ok ? await response.json() : document);
    } catch {
      setSelectedDocument(document);
    }
  };

  const handlePublishDocument = async () => {
    if (!selectedDocument) return;
    setPublishState("loading");
    setPublishMessage("");
    try {
      const response = await apiFetch(`/api/documents/jobs/${selectedDocument.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "PUBLISH" }),
      });
      const document = await response.json().catch(() => null);
      if (!response.ok) throw new Error(document?.detail ?? "Unable to publish the Confluence page.");
      replaceDocument(document);
      setPublishState("complete");
      setPublishMessage("Published to Confluence.");
    } catch (error) {
      setPublishState("error");
      setPublishMessage(error.message);
    }
  };

  const handleLogin = async ({ username, password }) => {
    const response = await fetch(`${apiBaseUrl}/api/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.detail ?? "Unable to sign in.");
    }

    saveAuthSession(payload);
    setUser(payload.user);
    setAuthState("authenticated");
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setAuthState("unauthenticated");
  };

  if (authState === "loading") return <main className={isDark ? "dark min-h-screen" : "min-h-screen"} />;

  if (authState === "unauthenticated") {
    return <LoginPage isDark={isDark} onLogin={handleLogin} onToggleTheme={toggleTheme} />;
  }

  return (
    <main className={isDark ? "dark min-h-screen" : "min-h-screen"}>
      <div className='min-h-screen bg-ampere-surface text-ampere-black dark:bg-ampere-black dark:text-white'>
        <AppHeader isDark={isDark} user={user} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        <div className='mx-auto  px-5 py-10 md:px-8 md:py-14'>
          <div className='mb-10 flex  flex-col gap-3'>
            <p className='text-xs font-semibold uppercase tracking-widest text-ampere-red'>Documentation workspace</p>
            <h1 className='text-3xl font-semibold text-ampere-black dark:text-white md:text-4xl'>Generate an Confluence document</h1>
            <p className=' text-base leading-6 text-ampere-muted dark:text-neutral-400'>
              Upload the relevant source and describe the requested workflow. Codex uses the installed server and Confluence skills.
            </p>
          </div>
          <div className="grid gap-12 lg:grid-cols-[3fr_1fr]">
            <DocumentGeneratorForm
              connectionState={connectionState}
              confluenceConnection={confluenceConnection}
              confluenceSiteUrl={confluenceSiteUrl}
              confluenceEmail={confluenceEmail}
              confluenceToken={confluenceToken}
              confluenceError={confluenceError}
              title={title}
              instructions={instructions}
              sourceFiles={sourceFiles}
              targetUrl={targetUrl}
              referenceConfluenceUrl={referenceConfluenceUrl}
              confluencePublishUrl={confluencePublishUrl}
              isGenerating={isGenerating}
              generationError={generationError}
              onTitleChange={setTitle}
              onConfluenceSiteUrlChange={setConfluenceSiteUrl}
              onConfluenceEmailChange={setConfluenceEmail}
              onConfluenceTokenChange={setConfluenceToken}
              onSaveConfluenceConnection={handleSaveConfluenceConnection}
              onInstructionsChange={setInstructions}
              onSourceFilesChange={setSourceFiles}
              onTargetUrlChange={setTargetUrl}
              onReferenceConfluenceUrlChange={setReferenceConfluenceUrl}
              onConfluencePublishUrlChange={setConfluencePublishUrl}
              onSubmit={handleGenerate}
            />
            <RecentDocuments documents={documents} onOpen={handleOpenDocument} />
          </div>
        </div>
        {selectedDocument && (
          <DraftPreview
            document={selectedDocument}
            onClose={() => {
              setSelectedDocument(null);
              setOperationState("idle");
              setOperationMessage("");
              setPublishState("idle");
              setPublishMessage("");
            }}
            onOperationConfirm={handleOperationConfirm}
            operationMessage={operationMessage}
            operationState={operationState}
            onPublish={handlePublishDocument}
            publishMessage={publishMessage}
            publishState={publishState}
          />
        )}
      </div>
    </main>
  );
};

export default App;
