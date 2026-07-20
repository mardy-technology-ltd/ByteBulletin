export default function AboutPage() {
  return (
    <div className="container py-10 max-w-3xl mx-auto text-center">
      <h1 className="font-heading text-5xl font-extrabold tracking-tight mb-6">About ByteBulletin</h1>
      <p className="text-xl text-muted-foreground mb-12">
        We are on a mission to organize the world&apos;s news using artificial intelligence.
      </p>
      
      <div className="space-y-8 text-left">
        <section>
          <h2 className="text-2xl font-bold mb-4">The Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Information overload is real. We built ByteBulletin to cut through the noise...
          </p>
        </section>
      </div>
    </div>
  );
}
