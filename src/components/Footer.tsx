
export function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#EAEAEA]">
      <div className="container-editorial py-16 md:py-20">
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-caption text-[#111111]">
            © {new Date().getFullYear()} Sigma. All rights reserved.
          </p>
          <p className="text-caption text-[#111111]">
            Designed in South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}

