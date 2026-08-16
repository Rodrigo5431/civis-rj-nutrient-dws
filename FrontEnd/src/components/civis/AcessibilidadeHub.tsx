import { useEffect, useState } from "react";
import { Accessibility, Languages, Minus, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FONT_KEY = "civis-font-scale";
const THEME_KEY = "civis-theme";

type Theme = "dark" | "light";

type WindowWithVLibras = Window & {
  civisOpenVLibras?: () => void;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.colorScheme = theme;
  if (theme === "dark") { 
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

function applyFontScale(scale: number) {
  document.documentElement.style.setProperty("--app-font-scale", String(scale));
}

function openVlibrasWidget() {
  const win = window as WindowWithVLibras;
  console.log("[VLibras] clique no botão do hub");

  if (win.civisOpenVLibras) {
    console.log("[VLibras] função global encontrada, abrindo widget");
    win.civisOpenVLibras();
    return;
  }

  console.log("[VLibras] função global ainda não disponível, usando fallback de seletores");

  const selectors = [
    "[vw-access-button='true'] button",
    "[vw-access-button='true']",
    "[vw-access-button] button",
    "[vw-access-button]",
  ];

  const tryOpen = (attempt: number) => {
    for (const selector of selectors) {
      const widgetButton = document.querySelector<HTMLElement>(selector);
      if (widgetButton) {
        console.log("[VLibras] seletor encontrado", selector, widgetButton);
        widgetButton.click();
        return;
      }
    }

    console.log("[VLibras] nenhum seletor encontrado na tentativa", attempt + 1);
    if (attempt < 20) {
      window.setTimeout(() => tryOpen(attempt + 1), 150);
    }
  };

  tryOpen(0);
}

export function AcessibilidadeHub() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : prefersDark ? "dark" : "light";
    const storedScale = Number.parseFloat(localStorage.getItem(FONT_KEY) ?? "1") || 1;

    setTheme(nextTheme);
    setScale(storedScale);
    applyTheme(nextTheme);
    applyFontScale(storedScale);
  }, []);

  const updateTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const updateScale = (delta: number) => {
    const next = Math.min(1.5, Math.max(0.8, +(scale + delta).toFixed(2)));
    setScale(next);
    applyFontScale(next);
    localStorage.setItem(FONT_KEY, String(next));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Acessibilidade"
          className="fixed bottom-6 left-6 z-50 size-12 rounded-full border-white/20 bg-slate-900/80 text-cyan-300 shadow-lg backdrop-blur"
        >
          <Accessibility className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 border-white/10 bg-slate-950/95 text-slate-100">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              VLibras
            </p>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={openVlibrasWidget}>
              <Languages className="mr-2 size-4" /> Abrir tradutor em Libras
            </Button>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Tema
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={theme === "dark" ? "secondary" : "outline"}
                size="sm"
                onClick={() => updateTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <Moon className="mr-1 size-4" /> Escuro
              </Button>
              <Button
                variant={theme === "light" ? "secondary" : "outline"}
                size="sm"
                onClick={() => updateTheme("light")}
                aria-pressed={theme === "light"}
              >
                <Sun className="mr-1 size-4" /> Claro
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Fonte ({Math.round(scale * 100)}%)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => updateScale(-0.1)}>
                <Minus className="mr-1 size-4" /> A-
              </Button>
              <Button variant="outline" size="sm" onClick={() => updateScale(0.1)}>
                <Plus className="mr-1 size-4" /> A+
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}