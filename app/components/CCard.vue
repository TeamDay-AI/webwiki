<template>
  <div :class="cardClasses">
    <div
      v-if="$slots.header"
      class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <slot name="header" />
    </div>
    <div class="px-6 py-4">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: "solid" | "outline" | "ghost";
  shadow?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "solid",
  shadow: "md",
});

const cardClasses = computed(() => {
  const baseClasses = "rounded-lg overflow-hidden";

  const variantClasses = {
    solid:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    outline: "bg-transparent border border-gray-200 dark:border-gray-700",
    ghost: "bg-transparent",
  };

  const shadowClasses = {
    xs: "shadow-xs",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  };

  return [
    baseClasses,
    variantClasses[props.variant],
    props.variant !== "ghost" ? shadowClasses[props.shadow] : "",
  ]
    .filter(Boolean)
    .join(" ");
});
</script>
