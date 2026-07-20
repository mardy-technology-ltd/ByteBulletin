export default function PrivacyPolicyPage() {
  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <h1 className="font-heading text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>1. Information We Collect</h2>
        <p>We only collect the information necessary to provide you with the best news experience.</p>
      </div>
    </div>
  );
}
