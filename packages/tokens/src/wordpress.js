/**
 * Style Dictionary format: WordPress block theme `theme.json` (v3).
 * Presets reference the generated CSS custom properties so the front end and
 * the editor share one source, and brand/mode switching still works.
 */
const cssVar = (t) => `var(--${t.name})`;
const label = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function registerWordPressFormat(StyleDictionary) {
  StyleDictionary.registerFormat({
    name: 'wordpress/theme-json',
    format: ({ dictionary }) => {
      const by = (prefix) => dictionary.allTokens.filter((t) => t.path.join('.').startsWith(prefix));
      const palette = [
        ...by('color.bg'),
        ...by('color.text'),
        ...by('color.action'),
        ...by('color.border'),
      ].map((t) => ({ slug: t.path.slice(1).join('-'), name: label(t.path.slice(1).join(' ')), color: cssVar(t) }));

      const fontSizes = by('font.size').map((t) => ({ slug: t.path.at(-1), name: t.path.at(-1).toUpperCase(), size: t.$value ?? t.value }));
      const spacingSizes = by('space')
        .filter((t) => t.path[1] !== '0')
        .map((t) => ({ slug: t.path[1], name: `Space ${t.path[1]}`, size: cssVar(t) }));
      const fontFamilies = by('brand.font').map((t) => ({
        slug: t.path.at(-1),
        name: label(t.path.at(-1)),
        fontFamily: t.$value ?? t.value,
      }));

      const theme = {
        $schema: 'https://schemas.wp.org/trunk/theme.json',
        version: 3,
        settings: {
          appearanceTools: true,
          color: { defaultPalette: false, defaultGradients: false, palette },
          typography: { defaultFontSizes: false, fluid: true, fontSizes, fontFamilies },
          spacing: { defaultSpacingSizes: false, spacingSizes, units: ['px', 'rem', '%', 'vw'] },
          layout: { contentSize: 'var(--oz-size-measure, 68ch)', wideSize: 'var(--oz-size-container-lg, 64rem)' },
        },
        styles: {
          color: { background: 'var(--wp--preset--color--bg-default)', text: 'var(--wp--preset--color--text-default)' },
          typography: { fontFamily: 'var(--wp--preset--font-family--body)', lineHeight: 'var(--oz-font-line-height-normal)' },
          elements: {
            heading: { typography: { fontFamily: 'var(--wp--preset--font-family--heading)', lineHeight: 'var(--oz-font-line-height-tight)' } },
            link: {
              color: { text: 'var(--wp--preset--color--text-link)' },
              ':hover': { color: { text: 'var(--wp--preset--color--text-link-hover)' } },
            },
            button: {
              color: { background: 'var(--wp--preset--color--action-primary)', text: 'var(--wp--preset--color--action-on-primary)' },
              border: { radius: 'var(--oz-brand-radius-control)' },
              ':hover': { color: { background: 'var(--wp--preset--color--action-primary-hover)' } },
            },
          },
        },
      };
      return JSON.stringify(theme, null, 2) + '\n';
    },
  });
}
