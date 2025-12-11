import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
        <main className="flex-1 pt-0">
             {children}
        </main>
        <WhatsAppButton />
        
        <Footer />
    </div>
  );
}
