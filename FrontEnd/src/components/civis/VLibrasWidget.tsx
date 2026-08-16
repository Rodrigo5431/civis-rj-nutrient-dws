import { useEffect, useState } from "react";

declare global {
  interface Window {
    VLibras?: any;
  }
}

export function VLibrasWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Trava para o Strict Mode não injetar o script duas vezes
    if (document.getElementById("vlibras-script-civis")) return;

    const script = document.createElement("script");
    script.id = "vlibras-script-civis";
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
        
        if (document.readyState === "complete") {
          window.dispatchEvent(new Event("load"));
        }
      }
    };
    
    document.body.appendChild(script);
  }, [mounted]);

  // Durante o carregamento do servidor, retorna nulo para concordar com o React
  if (!mounted) return null;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <div vw class="enabled">
            <div vw-access-button class="active"></div>
            <div vw-plugin-wrapper>
              <div class="vw-plugin-top-wrapper"></div>
            </div>
          </div>
        `,
      }}
    />
  );
}