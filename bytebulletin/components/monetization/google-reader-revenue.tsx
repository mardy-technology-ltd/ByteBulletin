"use client";

import Script from "next/script";

export function GoogleReaderRevenue() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://news.google.com/swg/js/v1/swg-basic.js"
      />
      <Script
        id="google-reader-revenue"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (self.SWG_BASIC = self.SWG_BASIC || []).push( function(basicSubscriptions) {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow06rHDA:openaccess",
                clientOptions: { theme: "light", lang: "en-GB" },
              });
            });
          `,
        }}
      />
    </>
  );
}
