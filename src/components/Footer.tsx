
export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-editorial py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-caption text-background/40">
            © {new Date().getFullYear()} Sigma. All rights reserved.
          </p>
          <p className="text-caption text-background/40">
            Designed in South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
