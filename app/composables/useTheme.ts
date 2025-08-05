export interface Theme {
  id: string;
  name: string;
  description: string;
}

export const themes: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and modern design with system fonts",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Classic serif typography for enhanced readability",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout with smaller fonts for maximum content",
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Monospace fonts for a developer-focused experience",
  },
];

export const useTheme = () => {
  const currentTheme = useState<string>("theme", () => "default");

  // Load theme from localStorage on client side
  onMounted(() => {
    if (process.client) {
      const savedTheme = localStorage.getItem("wiki-theme");
      if (savedTheme && themes.find((t) => t.id === savedTheme)) {
        currentTheme.value = savedTheme;
      }
    }
  });

  // Watch for theme changes and save to localStorage
  watch(
    currentTheme,
    (newTheme) => {
      if (process.client) {
        localStorage.setItem("wiki-theme", newTheme);
        // Apply theme class to document root
        const existingClasses = document.documentElement.className
          .split(" ")
          .filter((cls) => !cls.startsWith("theme-"))
          .join(" ");
        document.documentElement.className =
          `${existingClasses} theme-${newTheme}`.trim();
      }
    },
    { immediate: true }
  );

  const setTheme = (themeId: string) => {
    if (themes.find((t) => t.id === themeId)) {
      currentTheme.value = themeId;
    }
  };

  const getCurrentTheme = () => {
    return themes.find((t) => t.id === currentTheme.value) || themes[0];
  };

  return {
    themes,
    currentTheme: readonly(currentTheme),
    setTheme,
    getCurrentTheme,
  };
};
