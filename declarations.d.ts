/// <reference types="next/image-types/global" />
// ↑ Next's types for static image imports (.svg, .png, .jpg, …) → StaticImageData.
//   Normally supplied by the generated (git-ignored) next-env.d.ts, so a fresh
//   checkout — like CI — wouldn't have them.

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
