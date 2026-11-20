import { html } from 'lit';

export default { title: 'Foundations/Prose', parameters: { chromatic: { modes: (await import('../.storybook/modes.js')).allModes } } };

export const BlogPost = {
  render: () => html`<article class="oz-container oz-section"><div class="oz-prose">
    <h1>Designing for many brands</h1>
    <p>Long-form content uses <code>.oz-prose</code>, so WordPress post content picks up typography with no extra markup. <a href="#">Links</a> use the brand colour.</p>
    <h2>Why tokens</h2>
    <p>One source drives Figma Variables, CSS and the WordPress editor.</p>
    <ul><li>Core primitives</li><li>Semantic roles</li><li>Brand overrides</li></ul>
    <blockquote>Consistency is a feature.</blockquote>
    <pre><code>&lt;html data-brand="example-client" data-theme="dark"&gt;</code></pre>
    <p><a class="oz-button" href="#">Light-DOM button</a> <oz-button variant="secondary">Web component</oz-button></p>
  </div></article>`,
};
