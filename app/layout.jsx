export const metadata = {
  title: "31 for 31 · One scary movie for every night of October",
  description: "Thirty one horror movies, one for each night of October. Rate them, find where to stream them, and scroll through the whole tape.",
  icons: {
    icon: [{ url: "/assets/svg/favicon.svg", type: "image/svg+xml" }],
    apple: "/assets/img/apple-touch-icon.png",
  },
};

export const viewport = { themeColor: "#07090c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/fonts/Saans-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/SaansMono-Regular.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
