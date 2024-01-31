import { Providers } from "./providers";
import "./globals.css";
import { Card, Image } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="h-44 bg-white rounded-b-2xl flex flex-col justify-center items-center my-auto">
          <Image height={150} width={400} alt="LOGO" src="/logo-nobg.svg" />
        </div>
        <Providers>
          <Card className="mx-auto md:max-w-4xl min-w-2xl min-w-[40%]">
            <Toaster
              position="bottom-center"
              toastOptions={{
                success: {
                  style: {
                    background: "green",
                  },
                },
                error: {
                  style: {
                    background: "red",
                  },
                },
              }}
            />
            {children}
          </Card>
        </Providers>
      </body>
    </html>
  );
}
