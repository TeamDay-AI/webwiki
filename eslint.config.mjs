// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      "vue/attributes-order": "off",
      "vue/attribute-hyphenation": "off",
      "vue/component-name-in-template-casing": "off",
      "vue/html-comment-content-spacing": "off",
      "vue/html-indent": "off",
      "vue/html-quotes": "off",
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/mustache-interpolation-spacing": "off",
      "vue/no-multi-spaces": "off",
      "vue/no-spaces-around-equal-signs-in-attribute": "off",
      "vue/order-in-components": "off",
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/v-bind-style": "off",
      "vue/v-on-style": "off",
      "vue/v-slot-style": "off",
    },
  }
);
