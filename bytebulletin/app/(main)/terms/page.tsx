export default function TermsPage() {
  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <h1 className="font-heading text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using ByteBulletin, you accept and agree to be bound by the terms.</p>
      </div>
    </div>
  );
}
