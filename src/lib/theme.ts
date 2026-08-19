import {
  createTheme,
  Input,
  InputWrapper,
  Modal,
  PasswordInput,
  Select,
  Table,
  rem,
  Title,
} from "@mantine/core";

declare module "@mantine/core" {
  export interface MantineThemeOther {
    lineGradient: string[];
  }
}

export const sgaTheme = createTheme({
  primaryColor: "blue",
  primaryShade: 7,

  other: {
    lineGradient: [
      "linear-gradient(90deg, var(--mantine-color-blue-2) 0%, var(--mantine-color-blue-4) 58%, var(--mantine-color-blue-5) 100%)",

      "linear-gradient(135deg, var(--mantine-color-blue-3) 0%, var(--mantine-color-blue-4) 42%, var(--mantine-color-purple-4) 100%)",
    ],
  },

  colors: {
    // TU PALETA HERO
    brand: [
      "#edf8ff",
      "#d6eeff",
      "#addcff",
      "#75c4ff",
      "#4da3ff",
      "#2e82ff",
      "#1c66e6",
      "#103b66",
      "#0a2a4d",
      "#051a33",
    ],

    // MAIN
    blue: [
      "#FBFEFF",
      "#F5FBFF",
      "#EEF8FF",
      "#D6F0FF",
      "#8FCAF2",
      "#5EB0E6",
      "#4C80BD",
      "#1060BD",
      "#46598C",
      "#1D3980",
    ],

    orange: [
      "#FFFFFF",
      "#FFFDFB",
      "#FFFCFA",
      "#FFF9F6",
      "#FFF7F3",
      "#FFF3EE",
      "#FFE9E0",
      "#FFD9C9",
      "#F89573",
      "#ED6131",
    ],

    green: [
      "#FFFFFF",
      "#FDFEF9",
      "#FBFCF7",
      "#F7FAEE",
      "#F4F8E7",
      "#EEF5DA",
      "#E5F0C7",
      "#D4E7A8",
      "#B3D37B",
      "#93C637",
    ],

    pink: [
      "#FFFFFF",
      "#FEF9FC",
      "#FDF4F9",
      "#FCEDF5",
      "#FBE8F2",
      "#F8DAEA",
      "#F3C3DE",
      "#EB9FCA",
      "#DD64AC",
      "#D11D88",
    ],

    purple: [
      "#FFFFFF",
      "#F2F0F8",
      "#E6E1F1",
      "#D5CFE7",
      "#BBB0D5",
      "#9D8CC2",
      "#7662A9",
      "#55399B",
      "#9058AA",
      "#7B309E",
    ],

    navy: [
      "#F5F9FC",
      "#E4EEF7",
      "#C3D9ED",
      "#98BDE0",
      "#6B9AD0",
      "#457ABD",
      "#2A60A9",
      "#1D4E90",
      "#123D74",
      "#072C57",
    ],

    neutral: [
      "#FFFFFF",
      "#F7F7F7",
      "#ECECEC",
      "#D9D9D9",
      "#B8B8B8",
      "#8D8D8D",
      "#1F1F1F",
      "#111111",
      "#0D263B",
      "#000000",
    ],

    adminPending: [
      "#f3f4f6",
      "#e5e7eb",
      "#d1d5db",
      "#9ca3af",
      "#6b7280",
      "#4b5563",
      "#374151",
      "#1f2937",
      "#111827",
      "#030712",
    ],

    adminReview: [
      "#eef6ff",
      "#d9ebff",
      "#b8d8ff",
      "#8ebeff",
      "#5f9dff",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e3a8a",
      "#172554",
    ],

    adminSuccess: [
      "#edf9ef",
      "#d7f0dc",
      "#b3e1bd",
      "#84cd95",
      "#57b76d",
      "#389a53",
      "#2b7f43",
      "#226638",
      "#1a4f2c",
      "#12391f",
    ],

    adminDanger: [
      "#fff0f0",
      "#ffdddd",
      "#ffc2c2",
      "#ff9a9a",
      "#ff6b6b",
      "#fa5252",
      "#e03131",
      "#c92a2a",
      "#a61e1e",
      "#7f1616",
    ],
  },

  components: {
    Container: {
      defaultProps: {
        sizes: {
          xs: 540,
          sm: 720,
          md: 960,
          lg: 1140,
          xl: 1320,
          xxl: 1560,
        },
      },
    },

   Title: Title.extend({
  styles: (_theme, props) => ({
    root:
      props.variant === "hero"
        ? {
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1.05,
            fontWeight: 800,
            color: "#103b66",
            letterSpacing: "-0.02em",
          }
        : {},
  }),
}),

    PasswordInput: PasswordInput.extend({
      defaultProps: {
        radius: "md",
        visibilityToggleButtonProps: {
          variant: "transparent",
          style: {
            color: "#1060BD",
            opacity: 1,
          },
        },
      },
      styles: {
        innerInput: {
          "::placeholder": {
            color: "var(--mantine-color-neutral-4)",
            opacity: 1,
          },
        },
        visibilityToggle: {
          color: "#1060BD",
          opacity: 1,
        },
      },
    }),

    Input: Input.extend({
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          "::placeholder": {
            color: "var(--mantine-color-neutral-4)",
            opacity: 1,
          },
        },
        section: {
          color: "var(--mantine-color-neutral-5)",
        },
      },
    }),

    InputWrapper: InputWrapper.extend({
      styles: {
        description: {
          color: "var(--mantine-color-neutral-5)",
        },
      },
    }),

    Select: Select.extend({
      styles: {
        option: {
          "&:hover:where(:not([data-combobox-selected], [data-combobox-disabled]))": {
            backgroundColor: "var(--mantine-color-brand-7) !important",
            color: "var(--mantine-color-white) !important",
          },
          '&[data-combobox-selected="true"]': {
            backgroundColor: "var(--mantine-color-brand-7)",
            color: "var(--mantine-color-white)",
          },
          '&[data-combobox-selected="true"]:hover': {
            backgroundColor: "var(--mantine-color-brand-8)",
            color: "var(--mantine-color-white)",
          },
          '&[data-combobox-active], &[data-combobox-hovered]': {
            backgroundColor: "var(--mantine-color-brand-7) !important",
            color: "var(--mantine-color-white) !important",
          },
        },
        dropdown: {
          borderColor: "rgba(16, 59, 102, 0.12)",
        },
      },
    }),

    Table: Table.extend({
      styles: {
        th: {
          backgroundColor: "var(--mantine-color-brand-7)",
          color: "var(--mantine-color-white)",
          fontWeight: 700,
          borderColor: "rgba(255, 255, 255, 0.14)",
        },
        td: {
          borderColor: "rgba(16, 59, 102, 0.12)",
        },
        tr: {
          '&[data-hover]:hover td': {
            backgroundColor: "var(--mantine-color-brand-0)",
          },
        },
      },
    }),

    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        size: 720,
        radius: "xl",
        padding: "xl",
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 3,
        },
      },
      styles: {
        content: {
          width: "min(92vw, 720px)",
          maxHeight: "min(88vh, 820px)",
        },
        header: {
          paddingBottom: rem(12),
        },
        title: {
          fontSize: rem(24),
          fontWeight: 700,
          color: "var(--mantine-color-brand-7)",
        },
        body: {
          paddingTop: rem(8),
        },
      },
    }),
  },

  spacing: {
    tiny: rem(8),
    xxxs: rem(12),
    xxs: rem(16),
    xs: rem(24),
    sm: rem(32),
    md: rem(40),
    lg: rem(48),
    xl: rem(64),
    paddingContainer: rem(82),
    xxl: rem(96),
    xxxl: rem(128),
    layoutInsetXs: rem(16),
    layoutInsetSm: rem(24),
    layoutInsetMd: rem(32),
    pagePadSm: rem(48),
    pagePadLg: rem(64),
    pageGapSm: rem(32),
    pageGapLg: rem(48),
    sectionGapSm: rem(24),
    sectionGapLg: rem(32),
    blockGapSm: rem(16),
    blockGapLg: rem(24),
    cardPadSm: rem(24),
    cardPadLg: rem(40),
    cardPadCompactSm: rem(16),
    cardPadCompactLg: rem(24),
    cardPadDenseSm: rem(12),
    cardPadDenseLg: rem(16),
  } as Record<string, string>,
});
